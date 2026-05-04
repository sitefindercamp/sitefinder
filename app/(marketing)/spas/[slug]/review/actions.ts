"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { upsertSpaReview, userOwnsSpa } from "@/lib/spa-reviews";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { sendReviewNotification } from "@/lib/resend";

export async function submitSpaReviewAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const spaId = String(formData.get("spa_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating") ?? 0);
  const photos = formData
    .getAll("photos")
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (!slug || !spaId) {
    redirect("/spas?error=Invalid+review+request" as Route);
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(`/spas/${slug}/review?error=Choose+a+rating+from+1+to+5` as Route);
  }

  if (!body) {
    redirect(`/spas/${slug}/review?error=Review+text+is+required` as Route);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?message=Please+sign+in+to+review" as Route);
  }

  const admin = createSupabaseAdminClient();
  const { data: spa } = await admin
    .from("spas")
    .select("id, name")
    .eq("id", spaId)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!spa) {
    redirect("/spas?error=Spa+not+found" as Route);
  }

  const isOwner = await userOwnsSpa(spaId, user.email);
  if (isOwner) {
    redirect(
      `/spas/${slug}/review?error=${encodeURIComponent(
        "Owners cannot review their own listing."
      )}` as Route
    );
  }

  // Fetch reviewer display name from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const reviewerName = profile?.display_name || user.email || "Anonymous";

  try {
    await upsertSpaReview({
      spaId,
      userId: user.id,
      rating,
      title,
      body,
      photos,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit review";
    redirect(`/spas/${slug}/review?error=${encodeURIComponent(message)}` as Route);
  }

  // Notify admin of new review
  await sendReviewNotification({
    spaName: spa.name,
    spaSlug: slug,
    reviewerName,
    rating,
    title: title || undefined,
    body,
  });

  revalidatePath(`/spas/${slug}`);
  revalidatePath("/admin/reviews");
  redirect(`/spas/${slug}?review_submitted=1` as Route);
}
