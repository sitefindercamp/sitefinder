"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPublishedSpaBySlug } from "@/lib/admin-spas";
import { submitClaimRequest } from "@/lib/spa-claims";
import { sendClaimNotification } from "@/lib/mailerlite";

export async function submitClaimAction(slug: string, formData: FormData) {
  const requester_name = formData.get("requester_name") as string;
  const requester_email = formData.get("requester_email") as string;
  const message = formData.get("message") as string | null;

  if (!requester_name || !requester_name.trim()) {
    redirect(`/claim/${slug}?error=Name+is+required` as Route);
  }

  if (!requester_email || !requester_email.trim()) {
    redirect(`/claim/${slug}?error=Email+is+required` as Route);
  }

  const spa = await getPublishedSpaBySlug(slug);
  if (!spa) {
    redirect(`/claim/${slug}?error=Spa+not+found` as Route);
  }

  const result = await submitClaimRequest(
    spa.id,
    requester_name.trim(),
    requester_email.trim(),
    message && message.trim() ? message.trim() : null
  );

  if (!result.success) {
    redirect(
      `/claim/${slug}?error=${encodeURIComponent(result.error || "Failed to submit claim")}` as Route
    );
  }

  // Notify admin
  await sendClaimNotification({
    spaName: spa.name,
    spaSlug: slug,
    requesterName: requester_name.trim(),
    requesterEmail: requester_email.trim(),
    message: message?.trim() || null,
  });

  revalidatePath(`/claim/${slug}`);
  redirect(`/claim/${slug}?success=true` as Route);
}
