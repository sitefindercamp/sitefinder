"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUserIsAdmin } from "@/lib/admin-auth";
import { type ReviewStatus, createAdminReview, updateReviewStatus } from "@/lib/spa-reviews";

const MODERATION_STATUSES = new Set<ReviewStatus>([
  "approved",
  "rejected",
  "hidden",
]);

export async function createAdminReviewAction(formData: FormData) {
  const { isAdmin } = await getCurrentUserIsAdmin();
  if (!isAdmin) {
    redirect("/admin?error=Not+authorized" as Route);
  }

  const spaId = String(formData.get("spa_id") ?? "").trim();
  const reviewerName = String(formData.get("reviewer_name") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "approved") as ReviewStatus;
  const reviewedAt = String(formData.get("reviewed_at") ?? "").trim() || null;

  if (!spaId || !reviewerName || !body) {
    redirect("/admin/reviews/new?error=" + encodeURIComponent("Spa, reviewer name, and review text are required.") as Route);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect("/admin/reviews/new?error=" + encodeURIComponent("Rating must be 1–5.") as Route);
  }

  try {
    await createAdminReview({
      spaId,
      reviewerName,
      rating,
      title: title || null,
      body,
      status,
      reviewedAt,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create review";
    redirect(`/admin/reviews/new?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/spas", "layout");
  redirect("/admin/reviews?success=Review+added" as Route);
}

export async function moderateReviewAction(formData: FormData) {
  const reviewId = String(formData.get("review_id") ?? "");
  const status = String(formData.get("status") ?? "") as ReviewStatus;

  const { isAdmin } = await getCurrentUserIsAdmin();
  if (!isAdmin) {
    redirect("/admin?error=Not+authorized" as Route);
  }

  if (!reviewId || !MODERATION_STATUSES.has(status)) {
    redirect("/admin/reviews?error=Invalid+moderation+request" as Route);
  }

  try {
    await updateReviewStatus(reviewId, status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update review";
    redirect(`/admin/reviews?error=${encodeURIComponent(message)}` as Route);
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/spas", "layout"); // clears all /spas and /spas/[slug] pages
  redirect(`/admin/reviews?status=${status}&success=Review+updated` as Route);
}
