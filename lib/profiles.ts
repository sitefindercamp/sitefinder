import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "./supabase/server";

export type UserRole = "admin" | "owner" | "user" | "advertiser";

export type Profile = {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

// ── Read ─────────────────────────────────────────────────────

/** Fetch the profile for the currently authenticated user. */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at, updated_at")
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/** Fetch a profile by Supabase auth user id (admin client — bypasses RLS). */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/** Fetch a profile by email (admin client). */
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, role, created_at, updated_at")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/** List all profiles (admin client), optionally filtered by role. */
export async function listAllProfiles(role?: UserRole): Promise<Profile[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("profiles")
    .select("id, email, role, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Profile[];
}

/** Count profiles grouped by role (admin client). */
export async function countProfilesByRole(): Promise<Record<UserRole, number>> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("role");
  return ((data ?? []) as { role: UserRole }[]).reduce(
    (acc, row) => {
      acc[row.role] = (acc[row.role] ?? 0) + 1;
      return acc;
    },
    { admin: 0, owner: 0, user: 0, advertiser: 0 } as Record<UserRole, number>
  );
}

// ── Write ────────────────────────────────────────────────────

/**
 * Upsert a profile row. Used by loginAction to bootstrap the first admin
 * (ADMIN_EMAILS env var) and by the claim approval flow to set owners.
 * Always uses the admin client so it bypasses RLS.
 */
export async function upsertProfile(
  userId: string,
  email: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, email: email.toLowerCase(), role },
      { onConflict: "id" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Change the role of an existing profile (admin panel). */
export async function setProfileRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
