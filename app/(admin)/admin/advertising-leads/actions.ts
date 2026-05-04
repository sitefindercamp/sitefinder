"use server";

import { revalidatePath } from "next/cache";
import { updateLeadStatus } from "@/lib/ad-campaigns";

export async function updateLeadStatusAction(formData: FormData) {
  const id = (formData.get("id") as string | null)?.trim() ?? "";
  const status = (formData.get("status") as string | null)?.trim() ?? "";

  if (!id || !status) return;

  await updateLeadStatus(id, status);
  revalidatePath("/admin/advertising-leads");
}
