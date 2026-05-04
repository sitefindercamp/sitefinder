"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminSpa, deleteAdminSpa, updateAdminSpa, updateSpaStatus, type SpaStatus } from "@/lib/admin-spas";
import {
  deleteSpaImage,
  deleteSpaImagesForSpa,
  reorderSpaImage,
  setFeaturedSpaImage,
  uploadSpaGalleryImages,
  uploadSpaLogo,
} from "@/lib/spa-images";

export async function createSpaAction(formData: FormData) {
  const createdSpa = await createAdminSpa(formData);

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);
  revalidatePath("/spas" as Route);

  redirect(`/admin/spas/${createdSpa.id}` as Route);
}

export async function updateSpaAction(id: string, formData: FormData) {
  await updateAdminSpa(id, formData);

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);
  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath("/spas" as Route);

  redirect("/admin/spas" as Route);
}

/** Same as updateSpaAction but stays on the edit page (no redirect). Used for autosave. */
export async function autoSaveSpaAction(id: string, formData: FormData): Promise<void> {
  await updateAdminSpa(id, formData);
  revalidatePath(`/admin/spas/${id}` as Route);
}

export async function deleteSpaAction(formData: FormData) {
  const id = formData.get("id");
  const slug = formData.get("slug");

  if (typeof id !== "string" || !id) {
    redirect("/admin/spas" as Route);
  }

  await deleteSpaImagesForSpa(id);
  await deleteAdminSpa(id);

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);
  revalidatePath("/spas" as Route);

  if (typeof slug === "string" && slug) {
    revalidatePath(`/spas/${slug}` as Route);
  }

  redirect("/admin/spas" as Route);
}

export async function updateSpaStatusAction(formData: FormData) {
  const id = formData.get("id");
  const newStatus = formData.get("status");
  const slug = formData.get("slug");

  if (typeof id !== "string" || !id || typeof newStatus !== "string") {
    redirect("/admin/spas" as Route);
  }

  const validStatuses: SpaStatus[] = ["draft", "published", "archived"];
  if (!validStatuses.includes(newStatus as SpaStatus)) {
    redirect("/admin/spas" as Route);
  }

  await updateSpaStatus(id, newStatus as SpaStatus);

  revalidatePath("/admin" as Route);
  revalidatePath("/admin/spas" as Route);

  if (typeof slug === "string" && slug) {
    revalidatePath(`/spas/${slug}` as Route);
  }

  redirect("/admin/spas" as Route);
}

export async function uploadSpaLogoAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const file = formData.get("logo");

  if (!(file instanceof File) || file.size <= 0) {
    redirect(`/admin/spas/${id}` as Route);
  }

  try {
    await uploadSpaLogo(id, file);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload logo.";
    redirect(`/admin/spas/${id}?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}

export async function uploadSpaGalleryImagesAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const files = formData
    .getAll("gallery")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length === 0) {
    redirect(`/admin/spas/${id}` as Route);
  }

  try {
    await uploadSpaGalleryImages(id, files);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload business photos.";
    redirect(`/admin/spas/${id}?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}

export async function setFeaturedSpaImageAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const imageId = formData.get("image_id");

  if (typeof imageId !== "string" || !imageId) {
    redirect(`/admin/spas/${id}` as Route);
  }

  await setFeaturedSpaImage(id, imageId);

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}

export async function deleteSpaImageAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const imageId = formData.get("image_id");

  if (typeof imageId !== "string" || !imageId) {
    redirect(`/admin/spas/${id}` as Route);
  }

  await deleteSpaImage(id, imageId);

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}

export async function reorderSpaImageAction(
  id: string,
  slug: string,
  formData: FormData
) {
  const draggedImageId = formData.get("dragged_image_id");
  const targetImageId = formData.get("target_image_id");

  if (
    typeof draggedImageId !== "string" ||
    !draggedImageId ||
    typeof targetImageId !== "string" ||
    !targetImageId
  ) {
    redirect(`/admin/spas/${id}` as Route);
  }

  await reorderSpaImage(id, draggedImageId, targetImageId);

  revalidatePath(`/admin/spas/${id}` as Route);
  revalidatePath(`/spas/${slug}` as Route);

  redirect(`/admin/spas/${id}` as Route);
}
