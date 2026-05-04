import type { Route } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listSpasForSelect } from "@/lib/ad-campaigns";
import { createCampaignAction } from "../actions";

export const metadata = { title: "New Campaign | Admin" };

type Props = {
  searchParams?: Promise<{
    error?: string;
    advertiser_name?: string;
    advertiser_email?: string;
    ad_type?: string;
    title?: string;
  }>;
};

export default async function NewCampaignPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;
  const spas = await listSpasForSelect();

  // Pre-fill values when converting from a lead
  const prefill = {
    title:            params?.title            ?? "",
    advertiser_name:  params?.advertiser_name  ?? "",
    advertiser_email: params?.advertiser_email ?? "",
    ad_type:          params?.ad_type          ?? "featured_listing",
  };

  return (
    <div className="flex flex-col gap-8">
      <PageIntro eyebrow="Admin · Ads" title="New campaign" description="Create a new ad campaign or sponsored placement." />

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={createCampaignAction} className="flex flex-col gap-6">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="title">Campaign title *</Label>
            <Input id="title" name="title" defaultValue={prefill.title} placeholder="e.g. Aqua Day Spa — Spring Promo" required autoFocus />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="advertiser_name">Advertiser name</Label>
            <Input id="advertiser_name" name="advertiser_name" defaultValue={prefill.advertiser_name} placeholder="Business name" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="advertiser_email">Advertiser email</Label>
            <Input id="advertiser_email" name="advertiser_email" type="email" defaultValue={prefill.advertiser_email} placeholder="contact@spa.com" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ad_type">Ad type *</Label>
            <select id="ad_type" name="ad_type" defaultValue={prefill.ad_type}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="featured_listing">Featured Listing</option>
              <option value="homepage_featured">Homepage Featured</option>
              <option value="directory_sponsored">Directory Sponsored</option>
              <option value="city_sponsored">City Sponsored</option>
              <option value="banner">Banner</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" defaultValue="pending"
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="spa_id">Linked spa</Label>
            <select id="spa_id" name="spa_id" defaultValue=""
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">— None —</option>
              {spas.map((spa) => (
                <option key={spa.id} value={spa.id}>{spa.name} ({spa.city})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="placement_key">Placement key</Label>
            <Input id="placement_key" name="placement_key" placeholder="e.g. city:los-angeles-ca" />
            <p className="text-xs text-muted-foreground">For city/state targeting: city:los-angeles-ca or state:california</p>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="target_url">Target URL</Label>
            <Input id="target_url" name="target_url" type="url" placeholder="https://yourspa.com" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" type="url" placeholder="https://example.com/banner.jpg" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="starts_at">Start date</Label>
            <Input id="starts_at" name="starts_at" type="datetime-local" />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ends_at">End date</Label>
            <Input id="ends_at" name="ends_at" type="datetime-local" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea id="notes" name="notes" rows={3} placeholder="Notes visible only to admins…" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <a href={"/admin/ads" as Route} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to campaigns
          </a>
          <Button type="submit">Create campaign</Button>
        </div>
      </form>
    </div>
  );
}
