import { createSupabaseAdminClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AdType =
  | "featured_listing"
  | "homepage_featured"
  | "directory_sponsored"
  | "city_sponsored"
  | "banner";

export type AdStatus = "pending" | "active" | "paused" | "expired" | "rejected";

export type AdCampaign = {
  id: string;
  spa_id: string | null;
  owner_user_id: string | null;
  advertiser_name: string | null;
  advertiser_email: string | null;
  title: string;
  ad_type: AdType;
  placement_key: string | null;
  image_url: string | null;
  target_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: AdStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  spa_name?: string | null;
  spa_slug?: string | null;
  spa_city?: string | null;
  spa_state?: string | null;
  spa_summary?: string | null;
  spa_image_url?: string | null;
};

export type AdMetrics = {
  campaign_id: string;
  metric_date: string;
  impressions: number;
  clicks: number;
};

export type AdvertisingLead = {
  id: string;
  spa_id: string | null;
  campaign_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  website: string | null;
  message: string | null;
  interest: string | null;
  status: string;
  created_at: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActiveDateRange(campaign: { starts_at: string | null; ends_at: string | null }) {
  const now = new Date();
  if (campaign.starts_at && new Date(campaign.starts_at) > now) return false;
  if (campaign.ends_at && new Date(campaign.ends_at) < now) return false;
  return true;
}

// ── Campaign queries ──────────────────────────────────────────────────────────

export async function listAllCampaigns(): Promise<AdCampaign[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*, spas(name, slug)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Array<Record<string, unknown>>).map((row) => {
    const spa = row.spas as { name: string; slug: string } | null;
    return {
      ...(row as unknown as AdCampaign),
      spa_name: spa?.name ?? null,
      spa_slug: spa?.slug ?? null,
    };
  });
}

export async function getCampaignById(id: string): Promise<AdCampaign | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*, spas(name, slug)")
    .eq("id", id)
    .single();

  if (error) return null;

  const row = data as unknown as Record<string, unknown>;
  const spa = row.spas as { name: string; slug: string } | null;
  return {
    ...(row as unknown as AdCampaign),
    spa_name: spa?.name ?? null,
    spa_slug: spa?.slug ?? null,
  };
}

export async function getActiveCampaignsByType(adType: AdType): Promise<AdCampaign[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*, spas(name, slug, city, state, summary)")
    .eq("status", "active")
    .eq("ad_type", adType)
    .or("starts_at.is.null,starts_at.lte.now()")
    .or("ends_at.is.null,ends_at.gte.now()");

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as Array<Record<string, unknown>>)
    .filter((row) =>
      isActiveDateRange({
        starts_at: row.starts_at as string | null,
        ends_at: row.ends_at as string | null,
      })
    )
    .map((row) => {
      const spa = row.spas as { name: string; slug: string; city: string; state: string; summary?: string } | null;
      return {
        ...(row as unknown as AdCampaign),
        spa_name: spa?.name ?? null,
        spa_slug: spa?.slug ?? null,
        spa_city: spa?.city ?? null,
        spa_state: spa?.state ?? null,
        spa_summary: spa?.summary ?? null,
        spa_image_url: null, // fetched separately if needed
      };
    });
}

export async function getActiveSponsoredSpas(): Promise<AdCampaign[]> {
  return getActiveCampaignsByType("directory_sponsored");
}

export async function getActiveFeaturedListings(): Promise<AdCampaign[]> {
  return getActiveCampaignsByType("featured_listing");
}

export async function getActiveHomepageFeatured(): Promise<AdCampaign[]> {
  return getActiveCampaignsByType("homepage_featured");
}

export async function getActiveBannerCampaign(): Promise<AdCampaign | null> {
  const campaigns = await getActiveCampaignsByType("banner");
  return campaigns[0] ?? null;
}

// ── Campaign mutations ────────────────────────────────────────────────────────

export type CampaignInput = {
  title: string;
  advertiser_name: string;
  advertiser_email: string;
  ad_type: AdType;
  spa_id?: string | null;
  placement_key?: string | null;
  image_url?: string | null;
  target_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  status?: AdStatus;
  notes?: string | null;
};

export async function createCampaign(input: CampaignInput): Promise<AdCampaign> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .insert({ ...input, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as AdCampaign;
}

export async function updateCampaign(id: string, input: Partial<CampaignInput>): Promise<AdCampaign> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ad_campaigns")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as AdCampaign;
}

export async function updateCampaignStatus(id: string, status: AdStatus): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ad_campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteCampaign(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("ad_campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export async function incrementImpressions(campaignIds: string[]): Promise<void> {
  if (campaignIds.length === 0) return;
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];

  for (const campaignId of campaignIds) {
    await supabase.rpc("upsert_ad_impression", {
      p_campaign_id: campaignId,
      p_date: today,
    });
  }
}

export async function incrementClick(campaignId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];
  await supabase.rpc("upsert_ad_click", {
    p_campaign_id: campaignId,
    p_date: today,
  });
}

export async function getCampaignMetrics(campaignId: string): Promise<AdMetrics[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ad_metrics")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("metric_date", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as AdMetrics[];
}

export async function getAllCampaignMetricTotals(): Promise<
  Map<string, { impressions: number; clicks: number }>
> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("ad_metrics")
    .select("campaign_id, impressions, clicks");

  const totals = new Map<string, { impressions: number; clicks: number }>();
  for (const row of (data ?? []) as unknown as Array<Record<string, unknown>>) {
    const id = String(row.campaign_id);
    const existing = totals.get(id) ?? { impressions: 0, clicks: 0 };
    totals.set(id, {
      impressions: existing.impressions + Number(row.impressions ?? 0),
      clicks: existing.clicks + Number(row.clicks ?? 0),
    });
  }
  return totals;
}

// ── Advertising leads ─────────────────────────────────────────────────────────

export type LeadInput = {
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  website?: string;
  message?: string;
  interest?: string;
  spa_id?: string | null;
};

export async function submitAdvertisingLead(input: LeadInput): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("advertising_leads").insert(input);
  if (error) throw new Error(error.message);
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("advertising_leads")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAdvertisingLeads(): Promise<AdvertisingLead[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("advertising_leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AdvertisingLead[];
}

// ── Spa list for admin dropdowns ──────────────────────────────────────────────

export async function listSpasForSelect(): Promise<Array<{ id: string; name: string; city: string }>> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("spas")
    .select("id, name, city")
    .eq("status", "published")
    .order("name", { ascending: true });

  return ((data ?? []) as unknown as Array<{ id: string; name: string; city: string }>);
}
