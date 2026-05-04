"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteAdminSpa } from "@/lib/admin-spas";
import { ignoreGroup } from "@/lib/ignored-duplicates";
import { deleteSpaImagesForSpa } from "@/lib/spa-images";

/**
 * Keeps the selected spa and permanently deletes all others in the group.
 * Images are removed from storage before the DB row is deleted.
 *
 * Form fields expected:
 *   keep_id   – the spa ID to preserve
 *   group_ids – comma-separated list of ALL spa IDs in the duplicate group
 *   confirm   – must equal "yes" (checkbox guard)
 */
export async function mergeDuplicatesAction(formData: FormData) {
  const keepId = formData.get("keep_id");
  const groupIds = formData.get("group_ids");
  const confirm = formData.get("confirm");

  if (
    typeof keepId !== "string" ||
    !keepId ||
    typeof groupIds !== "string" ||
    !groupIds
  ) {
    redirect("/admin/duplicates?error=Invalid+form+data" as Route);
  }

  if (confirm !== "yes") {
    redirect("/admin/duplicates?error=Please+confirm+before+merging" as Route);
  }

  const allIds = groupIds.split(",").filter(Boolean);
  const deleteIds = allIds.filter((id) => id !== keepId);

  if (deleteIds.length === 0) {
    redirect("/admin/duplicates" as Route);
  }

  for (const id of deleteIds) {
    await deleteSpaImagesForSpa(id);
    await deleteAdminSpa(id);
  }

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);
  revalidatePath("/admin/duplicates" as Route);
  revalidatePath("/spas" as Route);

  redirect(
    `/admin/duplicates?merged=${deleteIds.length}` as Route
  );
}

/**
 * Marks every pair in a duplicate group as "not duplicates" so they
 * are suppressed from future detection runs.
 *
 * Form fields expected:
 *   group_ids – comma-separated list of ALL spa IDs in the duplicate group
 */
export async function ignoreDuplicateGroupAction(formData: FormData) {
  const groupIds = formData.get("group_ids");

  if (typeof groupIds !== "string" || !groupIds) {
    redirect("/admin/duplicates?error=Invalid+form+data" as Route);
  }

  const allIds = groupIds.split(",").filter(Boolean);

  try {
    await ignoreGroup(allIds);
  } catch {
    redirect("/admin/duplicates?error=Failed+to+ignore+group" as Route);
  }

  revalidatePath("/admin/duplicates" as Route);
  redirect("/admin/duplicates?ignored=1" as Route);
}
