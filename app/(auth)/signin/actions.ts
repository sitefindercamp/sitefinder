"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/signin?error=Invalid+form+submission" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect(
      `/signin?error=${encodeURIComponent(error?.message ?? "Sign-in failed")}` as Route
    );
  }

  // Route by role so owners and admins land in the right place.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role as string | undefined;

  if (role === "admin") {
    redirect("/admin" as Route);
  }
  if (role === "owner") {
    redirect("/owner/dashboard" as Route);
  }

  redirect("/account" as Route);
}
