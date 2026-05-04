"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { importCampgroundsFromCSV } from "@/lib/campground-importer";

export async function importCampgroundsAction(formData: FormData) {
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    redirect("/admin/imports/upload?error=No+file+selected" as Route);
  }

  if (!file.name.endsWith(".csv")) {
    redirect("/admin/imports/upload?error=Please+upload+a+CSV+file" as Route);
  }

  if (file.size > 5 * 1024 * 1024) {
    redirect("/admin/imports/upload?error=File+too+large+%28max+5MB%29" as Route);
  }

  const text = await file.text();
  const result = await importCampgroundsFromCSV(text, file.name);

  if (result.runId) {
    redirect(`/admin/imports/${result.runId}` as Route);
  }

  // Run tracking table may not exist yet — redirect to history with summary in query params
  const msg = `Imported+without+run+log+—+${result.inserted}+inserted,+${result.skipped}+skipped,+${result.errors}+errors`;
  redirect(`/admin/imports?notice=${msg}` as Route);
}
