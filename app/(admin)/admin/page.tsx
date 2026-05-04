import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { QualityBadge } from "@/components/admin/quality-badge";
import { StatCard } from "@/components/admin/stat-card";
import { PageIntro } from "@/components/layout/page-intro";
import { getAdminStats } from "@/lib/admin-stats";
import { getMissingFields } from "@/lib/quality-score";

export const metadata = {
  title: "Admin Dashboard",
};

const ATTENTION_PAGE_SIZE = 10;

type Props = {
  searchParams?: Promise<{ attn_page?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const attnPage = Math.max(1, parseInt(params?.attn_page ?? "1", 10));

  const stats = await getAdminStats();

  const attnTotal = stats.needsAttention.length;
  const attnTotalPages = Math.max(1, Math.ceil(attnTotal / ATTENTION_PAGE_SIZE));
  const attnPageClamped = Math.min(attnPage, attnTotalPages);
  const attnStart = (attnPageClamped - 1) * ATTENTION_PAGE_SIZE;
  const attnSlice = stats.needsAttention.slice(attnStart, attnStart + ATTENTION_PAGE_SIZE);

  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        eyebrow="Admin"
        title="Directory dashboard"
        description="Live counts and data quality overview for all spa listings."
      />

      {/* ── Hero numbers ─────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          size="hero"
          label="Total spas"
          value={stats.total}
          href={"/admin/spas" as Route}
        />
        <StatCard
          size="hero"
          label="Published"
          value={stats.published}
          href={"/admin/spas?status=published" as Route}
        />
        <StatCard
          size="hero"
          label="Total reviews"
          value={stats.totalReviews}
          href={"/admin/reviews" as Route}
        />
        <StatCard
          size="hero"
          label="Featured"
          value={stats.featured}
        />
      </section>

      {/* ── Action items + quality split ─────────────────────── */}
      <section className="grid gap-3 lg:grid-cols-2">

        {/* Needs action */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Needs action
          </p>
          <ul className="mt-3 divide-y divide-border">
            {(
              [
                {
                  label: "Pending reviews",
                  value: stats.pendingReviews,
                  href: "/admin/reviews?status=pending" as Route,
                  danger: stats.pendingReviews > 0,
                },
                {
                  label: "Possible duplicates",
                  value: stats.possibleDuplicates,
                  href: "/admin/duplicates" as Route,
                  danger: stats.possibleDuplicates > 0,
                },
                {
                  label: "Missing images",
                  value: stats.missingImages,
                  href: "/admin/spas?missing=images" as Route,
                  danger: stats.missingImages > 0,
                },
                {
                  label: "Draft listings",
                  value: stats.draft,
                  href: "/admin/spas?status=draft" as Route,
                  danger: false,
                },
                {
                  label: "Archived listings",
                  value: stats.archived,
                  href: "/admin/spas?status=archived" as Route,
                  danger: false,
                },
              ] as const
            ).map(({ label, value, href, danger }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-foreground"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {value === 0 ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    ) : danger ? (
                      <span className="size-2 shrink-0 rounded-full bg-yellow-400" />
                    ) : (
                      <span className="size-2 shrink-0 rounded-full bg-border" />
                    )}
                    {label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        value === 0
                          ? "font-medium tabular-nums text-muted-foreground/50"
                          : danger
                            ? "font-semibold tabular-nums text-yellow-700"
                            : "font-medium tabular-nums text-foreground"
                      }
                    >
                      {value}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground/40" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Listing quality */}
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Listing quality
          </p>
          <ul className="mt-3 divide-y divide-border">
            {(
              [
                {
                  label: "Missing website",
                  value: stats.missingWebsite,
                  href: "/admin/spas?missing=website" as Route,
                },
                {
                  label: "Missing phone",
                  value: stats.missingPhone,
                  href: "/admin/spas?missing=phone" as Route,
                },
                {
                  label: "Missing address",
                  value: stats.missingAddress,
                  href: "/admin/spas?missing=address" as Route,
                },
                {
                  label: "Missing hours",
                  value: stats.missingHours,
                  href: "/admin/spas?missing=hours" as Route,
                },
                {
                  label: "Missing amenities",
                  value: stats.missingAmenities,
                  href: "/admin/spas?missing=amenities" as Route,
                },
              ] as const
            ).map(({ label, value, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-foreground"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {value === 0 ? (
                      <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                    ) : (
                      <span className="size-2 shrink-0 rounded-full bg-border" />
                    )}
                    {label}
                  </span>
                  <span className="flex items-center gap-2">
                    <span
                      className={
                        value === 0
                          ? "font-medium tabular-nums text-muted-foreground/50"
                          : "font-medium tabular-nums text-foreground"
                      }
                    >
                      {value}
                    </span>
                    <ArrowRight className="size-3.5 text-muted-foreground/40" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Needs attention ─────────────────────────────────── */}
      {attnTotal > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Listings needing attention
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Each listing receives a quality score from 0–100 based on how
              complete its profile is.{" "}
              <span className="font-medium text-foreground">Images</span> and{" "}
              <span className="font-medium text-foreground">address</span> carry
              the most weight (20 pts each), followed by{" "}
              <span className="font-medium text-foreground">website</span>,{" "}
              <span className="font-medium text-foreground">phone</span>,{" "}
              <span className="font-medium text-foreground">hours</span>, and{" "}
              <span className="font-medium text-foreground">amenities</span> (15
              pts each). Scores below 80 appear here, sorted worst first.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Quality</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Missing</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {attnSlice.map((spa) => {
                  const missing = getMissingFields(spa.quality.breakdown);
                  return (
                    <tr
                      key={spa.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3 font-medium">{spa.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {[spa.city, spa.state].filter(Boolean).join(", ")}
                      </td>
                      <td className="px-4 py-3">
                        <QualityBadge quality={spa.quality} />
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {missing.length === 0 ? (
                          <span className="text-green-700">All complete</span>
                        ) : (
                          missing.join(", ")
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={spa.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/spas/${spa.id}` as Route}
                          className="text-sm font-medium text-primary hover:underline"
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

          {/* Pagination */}
          {attnTotalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {attnStart + 1}–{Math.min(attnStart + ATTENTION_PAGE_SIZE, attnTotal)} of{" "}
                {attnTotal} listings
              </span>
              <div className="flex gap-2">
                {attnPageClamped > 1 ? (
                  <Link
                    href={`/admin?attn_page=${attnPageClamped - 1}` as Route}
                    className="rounded-lg border border-border px-3 py-1.5 font-medium transition-colors hover:bg-secondary/40"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <span className="rounded-lg border border-border px-3 py-1.5 opacity-40">
                    ← Previous
                  </span>
                )}
                <span className="rounded-lg border border-border px-3 py-1.5">
                  {attnPageClamped} / {attnTotalPages}
                </span>
                {attnPageClamped < attnTotalPages ? (
                  <Link
                    href={`/admin?attn_page=${attnPageClamped + 1}` as Route}
                    className="rounded-lg border border-border px-3 py-1.5 font-medium transition-colors hover:bg-secondary/40"
                  >
                    Next →
                  </Link>
                ) : (
                  <span className="rounded-lg border border-border px-3 py-1.5 opacity-40">
                    Next →
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Recent imports ───────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Recent imports
          </h2>
          <Link
            href={"/admin/imports" as Route}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {stats.recentImports.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
            No import history yet.{" "}
            <Link
              href={"/admin/imports" as Route}
              className="font-medium text-primary hover:underline"
            >
              Learn how to track imports.
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">File</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Inserted</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Updated</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Errors</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentImports.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 font-medium">{run.filename}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(run.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{run.total_rows}</td>
                    <td className="px-4 py-3 tabular-nums text-green-700">{run.inserted_count}</td>
                    <td className="px-4 py-3 tabular-nums text-blue-700">{run.updated_count}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {run.error_count > 0 ? (
                        <span className="text-red-600">{run.error_count}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/imports/${run.id}` as Route}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-green-100 text-green-800"
      : status === "draft"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
