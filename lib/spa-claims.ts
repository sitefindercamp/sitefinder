import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "./supabase/server";
import { getProfileByEmail, setProfileRole } from "./profiles";

// Types
export type ClaimRequest = {
  id: string;
  spa_id: string;
  requester_name: string;
  requester_email: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

export type ClaimRequestWithSpa = ClaimRequest & {
  spa_name?: string;
  spa_city?: string;
  spa_state?: string;
};

export type SpaOwner = {
  id: string;
  spa_id: string;
  email: string;
  created_at: string;
};

/** Count pending claim requests (admin client). */
export async function countPendingClaims(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  const { count } = await supabase
    .from("spa_claim_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

// Submit a new claim request
export async function submitClaimRequest(
  spa_id: string,
  requester_name: string,
  requester_email: string,
  message: string | null
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("spa_claim_requests")
    .insert({
      spa_id,
      requester_name,
      requester_email,
      message,
      status: "pending",
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// List all claim requests (admin)
export async function listAllClaimRequests(): Promise<ClaimRequestWithSpa[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("spa_claim_requests")
    .select(
      `
      id,
      spa_id,
      requester_name,
      requester_email,
      message,
      status,
      created_at,
      updated_at,
      spas:spa_id(id, name, city, state)
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listing claim requests:", error);
    return [];
  }

  // Flatten the spa data
  // Supabase may return the joined record as an object or array depending on inferred cardinality
  type SpaRow = { name: string; city: string; state: string | null };
  type RawClaimRequest = {
    id: string;
    spa_id: string;
    requester_name: string;
    requester_email: string;
    message: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    spas?: SpaRow | SpaRow[] | null;
  };

  return (data as RawClaimRequest[] || []).map((claim) => {
    const spa = Array.isArray(claim.spas) ? claim.spas[0] : claim.spas;
    return {
      id: claim.id,
      spa_id: claim.spa_id,
      requester_name: claim.requester_name,
      requester_email: claim.requester_email,
      message: claim.message,
      status: claim.status as "pending" | "approved" | "rejected",
      created_at: claim.created_at,
      updated_at: claim.updated_at,
      spa_name: spa?.name,
      spa_city: spa?.city,
      spa_state: spa?.state ?? undefined,
    };
  });
}

// Get a single claim request
export async function getClaimRequest(
  claim_id: string
): Promise<ClaimRequestWithSpa | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("spa_claim_requests")
    .select(
      `
      id,
      spa_id,
      requester_name,
      requester_email,
      message,
      status,
      created_at,
      updated_at,
      spas:spa_id(id, name, city, state)
      `
    )
    .eq("id", claim_id)
    .single();

  if (error) {
    console.error("Error getting claim request:", error);
    return null;
  }

  if (!data) return null;

  type SpaRow = { name: string; city: string; state: string | null };
  const spasField = data.spas as SpaRow | SpaRow[] | null | undefined;
  const spa = Array.isArray(spasField) ? spasField[0] : spasField;

  return {
    id: data.id,
    spa_id: data.spa_id,
    requester_name: data.requester_name,
    requester_email: data.requester_email,
    message: data.message,
    status: data.status,
    created_at: data.created_at,
    updated_at: data.updated_at,
    spa_name: spa?.name,
    spa_city: spa?.city,
    spa_state: spa?.state ?? undefined,
  };
}

// Approve a claim request
export async function approveClaim(
  claim_id: string,
  spa_id: string,
  owner_email: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  // Update claim status to approved
  const { error: claimError } = await supabase
    .from("spa_claim_requests")
    .update({ status: "approved" })
    .eq("id", claim_id);

  if (claimError) {
    return { success: false, error: claimError.message };
  }

  // Insert or update spa owner
  const { error: ownerError } = await supabase
    .from("spa_owners")
    .upsert(
      { spa_id, email: owner_email },
      { onConflict: "spa_id" }
    );

  if (ownerError) {
    return { success: false, error: ownerError.message };
  }

  // Sync profiles.role → 'owner' for this email (if they have an auth account).
  const profile = await getProfileByEmail(owner_email);
  if (profile && profile.role !== "admin") {
    await setProfileRole(profile.id, "owner");
  }

  return { success: true };
}

// Revoke a spa owner's access (delete from spa_owners). Optionally also
// revert any approved claim row for that spa back to "pending" so a
// re-approval is required.
export async function revokeSpaOwner(
  spa_id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { error: deleteError } = await supabase
    .from("spa_owners")
    .delete()
    .eq("spa_id", spa_id);

  if (deleteError) {
    return { success: false, error: deleteError.message };
  }

  // Mark any approved claims for this spa as rejected so the audit trail
  // reflects revocation. Use "rejected" rather than "pending" to avoid
  // re-approval surfacing as a still-valid request.
  const { error: claimError } = await supabase
    .from("spa_claim_requests")
    .update({ status: "rejected" })
    .eq("spa_id", spa_id)
    .eq("status", "approved");

  if (claimError) {
    return { success: false, error: claimError.message };
  }

  // Sync profiles.role back to 'user' for the former owner.
  // Find their email from the claim rows for this spa.
  const adminClient = createSupabaseAdminClient();
  const { data: claimRow } = await adminClient
    .from("spa_claim_requests")
    .select("requester_email")
    .eq("spa_id", spa_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (claimRow?.requester_email) {
    const profile = await getProfileByEmail(claimRow.requester_email);
    if (profile && profile.role === "owner") {
      // Only demote if they don't own another spa
      const { data: otherSpas } = await adminClient
        .from("spa_owners")
        .select("id")
        .eq("email", claimRow.requester_email)
        .limit(1);
      if (!otherSpas || otherSpas.length === 0) {
        await setProfileRole(profile.id, "user");
      }
    }
  }

  return { success: true };
}

// Reject a claim request
export async function rejectClaim(
  claim_id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("spa_claim_requests")
    .update({ status: "rejected" })
    .eq("id", claim_id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Get spas owned by an email
export async function getSpasByOwnerEmail(
  email: string
): Promise<
  Array<{
    id: string;
    slug: string;
    name: string;
    city: string;
    state: string | null;
  }>
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("spa_owners")
    .select(
      `
      spas:spa_id(id, slug, name, city, state)
      `
    )
    .eq("email", email);

  if (error) {
    console.error("Error getting spas by owner email:", error);
    return [];
  }

  type SpaRow = {
    id: string;
    slug: string;
    name: string;
    city: string;
    state: string | null;
  };
  type RawOwnerRecord = {
    spas: SpaRow | SpaRow[] | null;
  };

  return (data as RawOwnerRecord[] || [])
    .map((owner) => (Array.isArray(owner.spas) ? owner.spas[0] : owner.spas))
    .filter((spa): spa is SpaRow => spa !== null && spa !== undefined);
}

// Get spa owner by spa_id
export async function getSpaOwner(spa_id: string): Promise<SpaOwner | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("spa_owners")
    .select("id, spa_id, email, created_at")
    .eq("spa_id", spa_id)
    .single();

  if (error) {
    console.error("Error getting spa owner:", error);
    return null;
  }

  return data;
}

// Check if a spa is owned by an email
export async function checkSpaOwnership(
  spa_id: string,
  email: string
): Promise<boolean> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("spa_id", spa_id)
    .eq("email", email)
    .single();

  if (error) {
    return false;
  }

  return !!data;
}
