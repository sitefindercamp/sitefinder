"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirm = formData.get("confirm_password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirm !== "string"
  ) {
    redirect("/signup?error=Invalid+form+submission" as Route);
  }

  if (password !== confirm) {
    redirect("/signup?error=Passwords+do+not+match" as Route);
  }

  if (password.length < 8) {
    redirect("/signup?error=Password+must+be+at+least+8+characters" as Route);
  }

  const supabase = await createSupabaseServerClient();

  // No emailRedirectTo — lets Supabase use the template URL as-is with
  // {{ .TokenHash }}, which sends users to /auth/confirm (no PKCE needed).
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(
      `/signup?error=${encodeURIComponent(error.message)}` as Route
    );
  }

  // Supabase sends a confirmation email — tell the user to check their inbox.
  redirect("/signup?verify=true" as Route);
}
