"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createCampaign,
  updateCampaign,
  updateCampaignStatus,
  deleteCampaign,
  type AdType,
  type AdStatus,
} from "@/lib/ad-campaigns";

function extractCampaignFields(formData: FormData) {
  const raw = (key: string) => (formData.get(key) as string | null)?.trim() || null;
  return {
    title: raw("title") ?? "",
    advertiser_name: raw("advertiser_name") ?? "",
    advertiser_email: raw("advertiser_email") ?? "",
    ad_type: (raw("ad_type") ?? "featured_listing") as AdType,
    spa_id: raw("spa_id"),
    placement_key: raw("placement_key"),
    image_url: raw("image_url"),
    target_url: raw("target_url"),
    starts_at: raw("starts_at"),
    ends_at: raw("ends_at"),
    status: (raw("status") ?? "pending") as AdStatus,
    notes: raw("notes"),
  };
}

function revalidateAds() {
  revalidatePath("/admin/ads" as Route);
  revalidatePath("/" as Route);
  revalidatePath("/spas" as Route);
}

export async function createCampaignAction(formData: FormData) {
  const fields = extractCampaignFields(formData);
  if (!fields.title) redirect("/admin/ads/new?error=Title+is+required" as Route);

  let id: string | null = null;
  let errorMsg: string | null = null;

  try {
    const campaign = await createCampaign(fields);
    id = campaign.id;
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to create campaign";
  }

  if (errorMsg || !id) {
    redirect((`/admin/ads/new?error=${encodeURIComponent(errorMsg ?? "Failed")}`) as Route);
  }

  revalidateAds();
  redirect((`/admin/ads/${id}?success=1`) as Route);
}

export async function updateCampaignAction(formData: FormData) {
  const id = (formData.get("id") as string | null) ?? "";
  if (!id) redirect("/admin/ads" as Route);

  const fields = extractCampaignFields(formData);
  let errorMsg: string | null = null;

  try {
    await updateCampaign(id, fields);
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to update campaign";
  }

  if (errorMsg) {
    redirect((`/admin/ads/${id}?error=${encodeURIComponent(errorMsg)}`) as Route);
  }

  revalidateAds();
  revalidatePath((`/admin/ads/${id}`) as Route);
  redirect((`/admin/ads/${id}?success=1`) as Route);
}

export async function setStatusAction(formData: FormData) {
  const id = (formData.get("id") as string | null) ?? "";
  const status = (formData.get("status") as AdStatus | null) ?? "pending";
  if (!id) redirect("/admin/ads" as Route);

  try {
    await updateCampaignStatus(id, status);
  } catch {
    // best-effort
  }

  revalidateAds();
  revalidatePath((`/admin/ads/${id}`) as Route);
  redirect((`/admin/ads/${id}?success=1`) as Route);
}

export async function deleteCampaignAction(formData: FormData) {
  const id = (formData.get("id") as string | null) ?? "";
  if (!id) redirect("/admin/ads" as Route);

  try {
    await deleteCampaign(id);
  } catch {
    // best-effort
  }

  revalidateAds();
  redirect("/admin/ads?deleted=1" as Route);
}
