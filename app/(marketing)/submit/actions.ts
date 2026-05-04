"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { sendCampgroundSubmissionNotification } from "@/lib/mailerlite";

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

export async function submitCampgroundAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const city = (formData.get("city") as string | null)?.trim() ?? "";
  const state = (formData.get("state") as string | null)?.trim() ?? "";

  if (!name || !city || !state) {
    redirect(
      ("/submit?error=" +
        encodeURIComponent("Campground name, city, and state are required.")) as Route
    );
  }

  const supabase = createSupabaseAdminClient();

  const baseSlug = toSlug(`${name} ${city} ${state}`);
  let slug = baseSlug;
  let attempt = 0;

  while (attempt < 5) {
    const { data: existing } = await supabase
      .from("campgrounds")
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

  const { error } = await supabase.from("campgrounds").insert({
    name,
    slug,
    city,
    state: state.toUpperCase(),
    status: "pending",
    website,
    phone,
    address: emptyToNull(formData.get("address")),
    description: emptyToNull(formData.get("description")),
    campground_type: emptyToNull(formData.get("campground_type")),
    submitted_by_email: submittedByEmail,
  });

  if (error) {
    redirect(
      ("/submit?error=" +
        encodeURIComponent("Something went wrong. Please try again.")) as Route
    );
  }

  await sendCampgroundSubmissionNotification({
    campgroundName: name,
    city,
    state,
    submitterEmail: submittedByEmail,
    website,
    phone,
  });

  redirect("/submit?success=1" as Route);
}

export const submitSpaAction = submitCampgroundAction;
