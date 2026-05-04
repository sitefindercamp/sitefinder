"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { submitAdvertisingLead } from "@/lib/ad-campaigns";
import { sendAdLeadNotification, sendAdLeadConfirmation } from "@/lib/mailerlite";

export async function submitAdvertisingLeadAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const company_name = (formData.get("company_name") as string | null)?.trim() || undefined;
  const website = (formData.get("website") as string | null)?.trim() || undefined;
  const phone = (formData.get("phone") as string | null)?.trim() || undefined;
  const message = (formData.get("message") as string | null)?.trim() || undefined;
  const interest = (formData.get("interest") as string | null)?.trim() || undefined;

  if (!name || !email) {
    redirect("/advertise?error=Name+and+email+are+required" as Route);
  }

  const lead = { name, email, company_name, website, phone, message, interest };

  try {
    await submitAdvertisingLead(lead);
  } catch {
    redirect("/advertise?error=Something+went+wrong.+Please+try+again." as Route);
  }

  await Promise.all([
    sendAdLeadNotification(lead),
    sendAdLeadConfirmation(lead),
  ]);

  redirect("/advertise?success=1" as Route);
}
