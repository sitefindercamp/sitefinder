import type { Route } from "next";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { listAllCampaigns, getAllCampaignMetricTotals } from "@/lib/ad-campaigns";

export const metadata = { title: "Ad Campaigns | Admin" };

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-800",
  pending:  "bg-yellow-100 text-yellow-800",
  paused:   "bg-blue-100 text-blue-800",
  expired:  "bg-gray-100 text-gray-600",
  rejected: "bg-red-100 text-red-800",
};

const AD_TYPE_LABELS: Record<string, string> = {
  featured_listing:    "Featured Listing",
  homepage_featured:   "Homepage Featured",
  directory_sponsored: "Directory Sponsored",
  city_sponsored:      "City Sponsored",
  banner:              "Banner",
};

export default async function AdminAdsPage() {
  const [campaigns, metricTotals] = await Promise.all([
    listAllCampaigns(),
    getAllCampaignMetricTotals(),
  ]);

  const byStatus = {
    pending:  campaigns.filter((c) => c.status === "pending"),
    active:   campaigns.filter((c) => c.status === "active"),
    paused:   campaigns.filter((c) => c.status === "paused"),
    expired:  campaigns.filter((c) => c.status === "expired"),
    rejected: campaigns.filter((c) => c.status === "rejected"),
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <PageIntro
          eyebrow="Admin · Monetization"
          title="Ad Campaigns"
          description="Manage featured listings, sponsored placements, and banners."
        />
        <Button asChild>
          <Link href={"/admin/ads/new" as Route}>
            <PlusCircle className="size-4" />
            New campaign
          </Link>
        </Button>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {([
          { label: "Active",   count: byStatus.active.length,   color: "text-green-600" },
          { label: "Pending",  count: byStatus.pending.length,  color: "text-yellow-600" },
          { label: "Paused",   count: byStatus.paused.length,   color: "text-blue-600" },
          { label: "Expired",  count: byStatus.expired.length,  color: "text-muted-foreground" },
        ] as const).map((stat) => (
          <div key={stat.label} className="surface p-4">
            <p className={`text-2xl font-semibold ${stat.color}`}>{stat.count}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Campaign table */}
      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Campaign</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Impressions</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Clicks</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Ends</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No campaigns yet.{" "}
                    <Link href={"/admin/ads/new" as Route} className="text-primary hover:underline">
                      Create one →
                    </Link>
                  </td>
                </tr>
              )}
              {campaigns.map((c) => {
                const metrics = metricTotals.get(c.id) ?? { impressions: 0, clicks: 0 };
                return (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{c.title}</p>
                      {c.spa_name && (
                        <p className="text-xs text-muted-foreground">{c.spa_name}</p>
                      )}
                      {c.advertiser_name && !c.spa_name && (
                        <p className="text-xs text-muted-foreground">{c.advertiser_name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {AD_TYPE_LABELS[c.ad_type] ?? c.ad_type}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? ""}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {metrics.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {metrics.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.ends_at
                        ? new Date(c.ends_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={(`/admin/ads/${c.id}`) as Route}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
