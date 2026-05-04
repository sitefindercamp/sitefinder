"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function deleteContactSubmissionAction(formData: FormData) {
  const id = formData.get("id") as string;
  const filter = formData.get("filter") as string | null;

  // Use the service-role client so RLS doesn't block the delete
  const supabase = createSupabaseAdminClient();
  await supabase.from("contact_submissions").delete().eq("id", id);

  revalidatePath("/admin/contact" as Route);

  const dest =
    filter && filter !== "all"
      ? `/admin/contact?filter=${filter}`
      : "/admin/contact";

  redirect(dest as Route);
}
