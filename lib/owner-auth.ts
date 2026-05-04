import type { Route } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/server";

// Get the authenticated user's email
export async function getOwnerEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email ?? null;
}

/**
 * Verify the current user is authenticated AND has role='owner' AND
 * owns the given spa. Redirects if any check fails.
 */
export async function verifyOwnerAccess(spa_id: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/owner/login" as Route);
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    redirect("/owner/login" as Route);
  }

  // Check spa ownership
  const { data: ownerRow } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("spa_id", spa_id)
    .eq("email", user.email ?? "")
    .single();

  if (!ownerRow) {
    redirect("/owner/dashboard?error=You+do+not+own+this+spa" as Route);
  }

  return user.email!;
}

/**
 * Verify the current user is authenticated AND has role='owner'.
 * Redirects to /owner/login if not.
 */
export async function verifyOwnerAuthenticated(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/owner/login" as Route);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    redirect("/owner/login" as Route);
  }

  return user.email!;
}
