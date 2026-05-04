"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSiteOrigin } from "@/lib/auth-helpers";

export async function requestOwnerMagicLinkAction(formData: FormData) {
  const emailRaw = formData.get("email");

  if (typeof emailRaw !== "string" || !emailRaw.trim()) {
    redirect("/owner/login?error=Please+enter+a+valid+email" as Route);
  }

  const email = emailRaw.trim().toLowerCase();
  const supabase = await createSupabaseServerClient();
  const origin = await getSiteOrigin();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/owner/dashboard`,
      // Default is true; magic link auto-creates the auth user on first sign-in.
      // Owner authorization is enforced at /auth/callback against spa_owners.
      shouldCreateUser: true,
    },
  });

  if (error) {
    redirect(
      `/owner/login?error=${encodeURIComponent(error.message)}` as Route
    );
  }

  redirect(
    `/owner/login?sent=${encodeURIComponent(email)}` as Route
  );
}
