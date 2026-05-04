"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-helpers";
import { upsertProfile } from "@/lib/profiles";

export async function loginAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=Invalid%20login%20payload" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Login failed")}` as Route);
  }

  // Bootstrap: if this email is in ADMIN_EMAILS, ensure their profile
  // reflects admin role. This is the only place ADMIN_EMAILS is used —
  // once the profile row says 'admin', the env var is no longer needed
  // for that user. All subsequent checks use profiles.role.
  if (isAdminEmail(data.user.email)) {
    await upsertProfile(data.user.id, data.user.email!, "admin");
  }

  redirect("/admin" as Route);
}
