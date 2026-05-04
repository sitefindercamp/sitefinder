"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { verifyOwnerAccess } from "@/lib/owner-auth";
import { updateAdminSpa, getAdminSpaById } from "@/lib/admin-spas";

export async function ownerSignOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Owner-safe spa update. Verifies ownership then updates the spa,
 * but preserves admin-only fields (status, is_featured) from the DB
 * so owners cannot change them.
 */
export async function updateOwnerSpaAction(spaId: string, formData: FormData) {
  await verifyOwnerAccess(spaId);

  // Fetch current values so we can lock admin-only fields
  const current = await getAdminSpaById(spaId);
  if (!current) redirect("/owner/dashboard" as Route);

  // Inject the locked values into formData before passing to updateAdminSpa
  formData.set("status", current.status);
  formData.set("is_featured", current.is_featured ? "on" : "");

  await updateAdminSpa(spaId, formData);

  revalidatePath(`/spas/${current.slug}`);
  revalidatePath("/owner/dashboard");

  redirect("/owner/dashboard?success=Listing+updated" as Route);
}
