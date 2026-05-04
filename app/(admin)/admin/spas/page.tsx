import type { Route } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { deleteSpaAction, updateSpaStatusAction } from "@/app/(admin)/admin/spas/actions";
import { DeleteSpaButton } from "@/components/admin/delete-spa-button";
import { QualityBadge } from "@/components/admin/quality-badge";
import { SpasListFilterBar } from "@/components/admin/spas-list-filter-bar";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { listAdminSpas, type AdminSpa, type SpaStatus } from "@/lib/admin-spas";
import { calculateQualityScore, getMissingFields } from "@/lib/quality-score";
import { getSpaIdsWithImages } from "@/lib/spa-images";

export const metadata = {
  title: "Admin Spas",
};

type Props = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    missing?: string;
    sort?: string;
  }>;
};

const VALID_STATUSES = new Set(["draft", "published", "archived", "pending"]);
const VALID_MISSING = new Set(["website", "phone", "address", "hours", "amenities", "images"]);
const VALID_SORTS = new Set(["name", "quality_asc", "quality_desc"]);

type SpaWithMeta = AdminSpa & { hasImages: boolean; qualityScore: number };

function applyFilters(
  spas: SpaWithMeta[],
  q: string,
  status: string,
  missing: string,
  sort: string
): SpaWithMeta[] {
  let results = [...spas];

  // Text search
  if (q) {
    const lower = q.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(lower) ||
        s.city.toLowerCase().includes(lower) ||
        (s.state?.toLowerCase().includes(lower)) ||
        (s.website?.toLowerCase().includes(lower)) ||
        (s.business_website?.toLowerCase().includes(lower)) ||
        (s.phone?.toLowerCase().includes(lower))
    );
  }

  // Status filter
  if (status && VALID_STATUSES.has(status)) {
    results = results.filter((s) => s.status === status);
  }

  // Missing field filter
  if (missing && VALID_MISSING.has(missing)) {
    switch (missing) {
      case "website":
        results = results.filter((s) => !s.website && !s.business_website);
        break;
      case "phone":
        results = results.filter((s) => !s.phone && !s.business_phone);
        break;
      case "address":
        results = results.filter((s) => !s.address_line_1 || !s.city || !s.state);
        break;
      case "hours":
        results = results.filter((s) => !s.hours_text);
        break;
      case "amenities":
        results = results.filter((s) => s.amenities.length === 0);
        break;
      case "images":
        results = results.filter((s) => !s.hasImages);
        break;
    }
  }

  // Sort
  if (sort && VALID_SORTS.has(sort)) {
    switch (sort) {
      case "name":
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "quality_asc":
        results.sort((a, b) => a.qualityScore - b.qualityScore);
        break;
      case "quality_desc":
        results.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
    }
  }

  return results;
}

function QuickStatusForm({
  spa,
  targetStatus,
  label,
}: {
  spa: AdminSpa;
  targetStatus: SpaStatus;
  label: string;
}) {
  return (
    <form action={updateSpaStatusAction}>
      <input type="hidden" name="id" value={spa.id} />
      <input type="hidden" name="slug" value={spa.slug} />
      <input type="hidden" name="status" value={targetStatus} />
      <button
        type="submit"
        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {label}
      </button>
    </form>
  );
}

export default async function AdminSpaListPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params?.q ?? "";
  const status = params?.status ?? "";
  const missing = params?.missing ?? "";
  const sort = params?.sort ?? "";

  const [allSpas, spaIdsWithImages] = await Promise.all([
    listAdminSpas(),
    getSpaIdsWithImages(),
  ]);

  const spasWithMeta: SpaWithMeta[] = allSpas.map((spa) => ({
    ...spa,
    hasImages: spaIdsWithImages.has(spa.id),
    qualityScore: calculateQualityScore(spa, spaIdsWithImages.has(spa.id)).score,
  }));

  const filtered = applyFilters(spasWithMeta, q, status, missing, sort);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageIntro
          eyebrow="Admin"
          title="Manage spa listings"
          description="Search, filter, and update every spa in the directory."
        />
        <Button asChild className="shrink-0">
          <Link href={"/admin/spas/new" as Route}>
            <Plus data-icon="inline-start" />
            Add spa
          </Link>
        </Button>
      </div>

      {/* Filter bar (client component — remounts on param changes) */}
      <SpasListFilterBar
        key={`${q}|${status}|${missing}|${sort}`}
        q={q}
        status={status}
        missing={missing}
        sort={sort}
      />

      {/* Result count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length === allSpas.length
          ? `${allSpas.length} listing${allSpas.length !== 1 ? "s" : ""}`
          : `${filtered.length} of ${allSpas.length} listing${allSpas.length !== 1 ? "s" : ""}`}
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-secondary/60 px-6 py-10 text-center text-sm text-muted-foreground">
          No listings match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Featured</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Quality</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Missing</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((spa) => {
                const quality = calculateQualityScore(spa, spa.hasImages);
                const missingFields = getMissingFields(quality.breakdown);
                // Pending submissions get Approve/Reject; others get standard transitions
                const otherStatuses: Array<{ status: SpaStatus; label: string }> =
                  spa.status === "pending"
                    ? [
                        { status: "draft", label: "Approve" },
                        { status: "archived", label: "Reject" },
                      ]
                    : (
                        [
                          { status: "published", label: "Publish" },
                          { status: "draft", label: "Draft" },
                          { status: "archived", label: "Archive" },
                        ] as Array<{ status: SpaStatus; label: string }>
                      ).filter((s) => s.status !== spa.status);

                return (
                  <tr key={spa.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <span className="font-medium">{spa.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {[spa.city, spa.state].filter(Boolean).join(", ")}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={spa.status} />
                    </td>
                    <td className="px-4 py-3">
                      {spa.is_featured ? (
                        <span className="text-xs font-medium text-primary">⭐ Yes</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <QualityBadge quality={quality} />
                    </td>
                    <td className="px-4 py-3">
                      {missingFields.length === 0 ? (
                        <span className="text-xs text-green-700">All complete</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {missingFields.join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/admin/spas/${spa.id}` as Route}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Edit
                        </Link>
                        {otherStatuses.map((s) => (
                          <QuickStatusForm
                            key={s.status}
                            spa={spa}
                            targetStatus={s.status}
                            label={s.label}
                          />
                        ))}
                        <DeleteSpaButton
                          action={deleteSpaAction}
                          id={spa.id}
                          name={spa.name}
                          slug={spa.slug}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-green-100 text-green-800"
      : status === "draft"
        ? "bg-yellow-100 text-yellow-800"
        : status === "pending"
          ? "bg-orange-100 text-orange-800"
          : "bg-gray-100 text-gray-600";

  const label = status === "pending" ? "pending review" : status;

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}
