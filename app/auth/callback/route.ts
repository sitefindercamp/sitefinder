import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertProfile } from "@/lib/profiles";

/**
 * Handles the redirect from a Supabase email confirmation or magic-link.
 *
 * Flow:
 *   1. Exchange the `code` query param for a session.
 *   2. Look up the now-authenticated user's profile (role).
 *   3. Route by role:
 *        admin  → /admin
 *        owner  → /owner/dashboard (or `next` param)
 *        user   → /account (or `next` param)
 *   4. If the user is in spa_owners but role isn't 'owner' yet, upgrade them.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(
        "Missing sign-in code. Please request a new link."
      )}`
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(exchangeError.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(
        "Sign-in succeeded but no email was returned."
      )}`
    );
  }

  // Fetch this user's profile to determine their role.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;

  // Admins always go to /admin.
  if (role === "admin") {
    return NextResponse.redirect(`${origin}/admin`);
  }

  // Check if this email is an approved spa owner.
  const { data: ownerRow } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (ownerRow || role === "owner") {
    // Ensure their profile reflects the owner role (idempotent).
    if (role !== "owner") {
      await upsertProfile(user.id, user.email, "owner");
    }
    const dest = next?.startsWith("/") ? next : "/owner/dashboard";
    return NextResponse.redirect(`${origin}${dest}`);
  }

  // Regular user (role='user' or freshly confirmed) — send to account page.
  const dest = next?.startsWith("/") ? next : "/account";
  return NextResponse.redirect(`${origin}${dest}`);
}
