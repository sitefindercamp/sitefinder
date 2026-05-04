import type { Route } from "next";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getCampaignById,
  getCampaignMetrics,
  listSpasForSelect,
} from "@/lib/ad-campaigns";
import {
  updateCampaignAction,
  setStatusAction,
  deleteCampaignAction,
} from "../actions";

export const metadata = { title: "Edit Campaign | Admin" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-800",
  pending:  "bg-yellow-100 text-yellow-800",
  paused:   "bg-blue-100 text-blue-800",
  expired:  "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-800",
};

export default async function EditCampaignPage({ params, searchParams }: Props) {
  const { id } = await params;
  const qp = await searchParams;
  const error = qp?.error ? decodeURIComponent(qp.error) : null;
  const success = qp?.success === "1";

  const [campaign, metrics, spas] = await Promise.all([
    getCampaignById(id),
    getCampaignMetrics(id),
    listSpasForSelect(),
  ]);

  if (!campaign) notFound();

  const totalImpressions = metrics.reduce((s, m) => s + m.impressions, 0);
  const totalClicks = metrics.reduce((s, m) => s + m.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";

  function localDatetime(iso: string | null) {
    if (!iso) return "";
    return iso.slice(0, 16); // trim to datetime-local format
  }

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin · Ads"
        title="Edit campaign"
        description={`Editing: ${campaign.title}`}
      />

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Changes saved.
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total impressions", value: totalImpressions.toLocaleString() },
          { label: "Total clicks",      value: totalClicks.toLocaleString() },
          { label: "CTR",               value: `${ctr}%` },
        ].map((stat) => (
          <div key={stat.label} className="surface p-4">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick-action status buttons */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4">
        <div className="mr-auto flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[campaign.status] ?? ""}`}>
            {campaign.status}
          </span>
        </div>
        {(["active", "paused", "rejected", "expired"] as const)
          .filter((s) => s !== campaign.status)
          .map((s) => (
            <form key={s} action={setStatusAction}>
              <input type="hidden" name="id" value={campaign.id} />
              <input type="hidden" name="status" value={s} />
              <Button type="submit" variant="outline" size="sm" className="capitalize">
                Mark {s}
              </Button>
            </form>
          ))}
      </div>

      {/* Edit form */}
      <form action={updateCampaignAction} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={campaign.id} />

        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="title">Campaign title *</Label>
            <Input id="title" name="title" defaultValue={campaign.title} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="advertiser_name">Advertiser name</Label>
            <Input id="advertiser_name" name="advertiser_name" defaultValue={campaign.advertiser_name ?? ""} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="advertiser_email">Advertiser email</Label>
            <Input id="advertiser_email" name="advertiser_email" type="email" defaultValue={campaign.advertiser_email ?? ""} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ad_type">Ad type</Label>
            <select id="ad_type" name="ad_type" defaultValue={campaign.ad_type}
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
            <select id="status" name="status" defaultValue={campaign.status}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="spa_id">Linked spa</Label>
            <select id="spa_id" name="spa_id" defaultValue={campaign.spa_id ?? ""}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">— None —</option>
              {spas.map((spa) => (
                <option key={spa.id} value={spa.id}>{spa.name} ({spa.city})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="placement_key">Placement key</Label>
            <Input id="placement_key" name="placement_key" defaultValue={campaign.placement_key ?? ""} placeholder="city:los-angeles-ca" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="target_url">Target URL</Label>
            <Input id="target_url" name="target_url" type="url" defaultValue={campaign.target_url ?? ""} />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" type="url" defaultValue={campaign.image_url ?? ""} />
            {campaign.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={campaign.image_url} alt="Ad preview" className="mt-2 h-32 w-full rounded-2xl object-cover" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="starts_at">Start date</Label>
            <Input id="starts_at" name="starts_at" type="datetime-local" defaultValue={localDatetime(campaign.starts_at)} />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ends_at">End date</Label>
            <Input id="ends_at" name="ends_at" type="datetime-local" defaultValue={localDatetime(campaign.ends_at)} />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="notes">Internal notes</Label>
            <Textarea id="notes" name="notes" rows={3} defaultValue={campaign.notes ?? ""} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <a href={"/admin/ads" as Route} className="text-sm text-muted-foreground hover:text-foreground">
              ← Back
            </a>
            <form action={deleteCampaignAction}>
              <input type="hidden" name="id" value={campaign.id} />
              <button
                type="submit"
                className="text-sm text-red-500 hover:text-red-700"
                onClick={(e) => {
                  if (!confirm("Delete this campaign?")) e.preventDefault();
                }}
              >
                Delete
              </button>
            </form>
          </div>
          <Button type="submit">Save changes</Button>
        </div>
      </form>

      {/* Recent metrics table */}
      {metrics.length > 0 && (
        <div className="surface overflow-hidden">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Daily metrics (last 30 days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Impressions</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Clicks</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">CTR</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice(0, 30).map((m) => (
                  <tr key={m.metric_date} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">{m.metric_date}</td>
                    <td className="px-4 py-3 tabular-nums">{m.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums">{m.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {m.impressions > 0
                        ? `${((m.clicks / m.impressions) * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
