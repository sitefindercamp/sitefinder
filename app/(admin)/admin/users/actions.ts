"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setProfileRole } from "@/lib/profiles";
import type { UserRole } from "@/lib/profiles";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function setUserRoleAction(formData: FormData) {
  const user_id = formData.get("user_id") as string;
  const role = formData.get("role") as UserRole;

  const validRoles: UserRole[] = ["admin", "owner", "user", "advertiser"];
  if (!user_id || !validRoles.includes(role)) {
    redirect("/admin/users?error=Invalid+request" as Route);
  }

  const result = await setProfileRole(user_id, role);

  if (!result.success) {
    redirect(
      `/admin/users?error=${encodeURIComponent(result.error || "Failed to update role")}` as Route
    );
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?success=Role+updated" as Route);
}

export async function deleteUserAction(formData: FormData) {
  const user_id = formData.get("user_id") as string;
  if (!user_id) {
    redirect("/admin/users?error=Invalid+request" as Route);
  }

  // Prevent deleting yourself
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.id === user_id) {
    redirect(
      `/admin/users?error=${encodeURIComponent("You cannot delete your own account.")}` as Route
    );
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user_id);

  if (error) {
    redirect(
      `/admin/users?error=${encodeURIComponent(error.message || "Failed to delete user")}` as Route
    );
  }

  revalidatePath("/admin/users");
  redirect("/admin/users?success=User+deleted" as Route);
}
