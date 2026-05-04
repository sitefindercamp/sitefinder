"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/signin?message=You+have+been+signed+out" as Route);
}

export async function updateProfileAction(formData: FormData) {
  const displayName = (formData.get("display_name") as string | null)?.trim() ?? "";

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin" as Route);
  }

  // Use admin client to bypass RLS for the update
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ display_name: displayName || null, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    redirect("/account?error=" + encodeURIComponent("Failed to update profile. Please try again.") as Route);
  }

  revalidatePath("/account" as Route);
  redirect("/account?success=profile" as Route);
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = formData.get("current_password") as string;
  const newPassword = formData.get("new_password") as string;
  const confirmPassword = formData.get("confirm_password") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/account?error=" + encodeURIComponent("All password fields are required.") as Route);
  }

  if (newPassword.length < 8) {
    redirect("/account?error=" + encodeURIComponent("New password must be at least 8 characters.") as Route);
  }

  if (newPassword !== confirmPassword) {
    redirect("/account?error=" + encodeURIComponent("New passwords do not match.") as Route);
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/signin" as Route);
  }

  // Re-authenticate with current password to verify it's correct
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    redirect("/account?error=" + encodeURIComponent("Current password is incorrect.") as Route);
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    redirect("/account?error=" + encodeURIComponent("Failed to update password. Please try again.") as Route);
  }

  revalidatePath("/account" as Route);
  redirect("/account?success=password" as Route);
}
