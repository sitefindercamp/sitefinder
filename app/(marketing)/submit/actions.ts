"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendSpaSubmissionNotification } from "@/lib/mailerlite";

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function submitSpaAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const city = (formData.get("city") as string | null)?.trim() ?? "";
  const state = (formData.get("state") as string | null)?.trim() ?? "";

  if (!name || !city || !state) {
    redirect(
      ("/submit?error=" +
        encodeURIComponent("Spa name, city, and state are required.")) as Route
    );
  }

  const supabase = createSupabaseAdminClient();

  const baseSlug = toSlug(`${name} ${city}`);
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 5) {
    const { data: existing } = await supabase
      .from("spas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!existing) break;

    attempt++;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const submittedByEmail = emptyToNull(formData.get("submitted_by_email"));
  const website = emptyToNull(formData.get("website"));
  const phone = emptyToNull(formData.get("phone"));

  const { error } = await supabase.from("spas").insert({
    name,
    slug,
    city,
    state,
    status: "pending",
    website,
    phone,
    address_line_1: emptyToNull(formData.get("address_line_1")),
    summary: emptyToNull(formData.get("summary")),
    important_notes: submittedByEmail ? `Submitted by: ${submittedByEmail}` : null,
  });

  if (error) {
    redirect(
      ("/submit?error=" +
        encodeURIComponent("Something went wrong. Please try again.")) as Route
    );
  }

  await sendSpaSubmissionNotification({ spaName: name, city, state, submitterEmail: submittedByEmail, website, phone });

  redirect("/submit?success=1" as Route);
}
