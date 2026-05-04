import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { upsertProfile } from "@/lib/profiles";

/**
 * SSR-safe email confirmation handler using token_hash (no PKCE cookie needed).
 * Supabase email templates should link here instead of /auth/callback.
 *
 * Template URL: {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = (searchParams.get("type") ?? "email") as EmailOtpType;
  const next = searchParams.get("next");

  if (!token_hash) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(
        "Invalid confirmation link. Please request a new one."
      )}`
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(error.message)}`
    );
  }

  // Get the now-confirmed user and route by role (same logic as /auth/callback)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(`${origin}/account`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;

  if (role === "admin") {
    return NextResponse.redirect(`${origin}/admin`);
  }

  const { data: ownerRow } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("email", user.email)
    .limit(1)
    .maybeSingle();

  if (ownerRow || role === "owner") {
    if (role !== "owner") {
      await upsertProfile(user.id, user.email, "owner");
    }
    const dest = next?.startsWith("/") ? next : "/owner/dashboard";
    return NextResponse.redirect(`${origin}${dest}`);
  }

  const dest = next?.startsWith("/") ? next : "/account";
  return NextResponse.redirect(`${origin}${dest}`);
}
