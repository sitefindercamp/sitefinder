"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";

import {
  sendContactNotification,
  sendContactConfirmation,
} from "@/lib/mailerlite";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function clean(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().slice(0, 2000) : "";
}

export async function submitContactAction(formData: FormData) {
  // ── Spam checks ────────────────────────────────────────────────────────────

  // 1. Honeypot — bots fill hidden fields, humans don't
  const honeypot = typeof formData.get("hp_url") === "string"
    ? (formData.get("hp_url") as string)
    : "";
  if (honeypot.trim() !== "") {
    // Fake success so bots don't retry
    redirect("/contact?success=1" as Route);
  }

  // 2. Timing — real humans take more than 3 seconds to fill a form
  const renderedAt = parseInt(
    typeof formData.get("_t") === "string" ? (formData.get("_t") as string) : "0",
    10
  );
  if (!renderedAt || Date.now() - renderedAt < 3000) {
    redirect("/contact?success=1" as Route);
  }

  // ── Field validation ───────────────────────────────────────────────────────

  const name = clean(formData.get("name"));
  const email = clean(formData.get("email"));
  const subject = clean(formData.get("subject")) || "General inquiry";
  const message = clean(formData.get("message"));

  if (!name || !email || !message) {
    redirect(
      ("/contact?error=" +
        encodeURIComponent("Name, email, and message are required.")) as Route
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(
      ("/contact?error=" +
        encodeURIComponent("Please enter a valid email address.")) as Route
    );
  }

  // Save to database
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("contact_submissions")
    .insert({ name, email, subject, message });

  // Send emails
  await Promise.all([
    sendContactNotification({ name, email, subject, message }),
    sendContactConfirmation({ name, email, subject, message }),
  ]);

  redirect("/contact?success=1" as Route);
}
