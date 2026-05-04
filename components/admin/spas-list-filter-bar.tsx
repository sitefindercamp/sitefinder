"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  q: string;
  status: string;
  missing: string;
  sort: string;
};

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending review" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

const MISSING_OPTIONS = [
  { value: "", label: "All fields" },
  { value: "website", label: "Missing website" },
  { value: "phone", label: "Missing phone" },
  { value: "address", label: "Missing address" },
  { value: "hours", label: "Missing hours" },
  { value: "amenities", label: "Missing amenities" },
  { value: "images", label: "Missing images" },
] as const;

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "name", label: "Name A–Z" },
  { value: "quality_asc", label: "Quality: Low → High" },
  { value: "quality_desc", label: "Quality: High → Low" },
] as const;

/**
 * Client component for the /admin/spas filter bar.
 * Receives current filter values as props (from server searchParams) so it
 * does NOT need useSearchParams() and avoids the Suspense requirement.
 */
export function SpasListFilterBar({ q, status, missing, sort }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(updates: Partial<Record<"q" | "status" | "missing" | "sort", string>>) {
    const merged = { q, status, missing, sort, ...updates };
    const params = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    router.replace((qs ? `${pathname}?${qs}` : pathname) as Route);
  }

  const hasActiveFilters = !!(q || missing || sort);

  return (
    <div className="flex flex-col gap-4">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-secondary/30 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => navigate({ status: tab.value })}
            className={cn(
              "rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
              status === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            navigate({ q: String(data.get("q") ?? "") });
          }}
          className="flex gap-2"
        >
          <Input
            key={q}
            name="q"
            defaultValue={q}
            placeholder="Search name, city, website, phone…"
            className="w-56 sm:w-72"
          />
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <select
          key={missing}
          defaultValue={missing}
          onChange={(e) => navigate({ missing: e.target.value })}
          className="h-9 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
        >
          {MISSING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          key={sort}
          defaultValue={sort}
          onChange={(e) => navigate({ sort: e.target.value })}
          className="h-9 rounded-xl border border-input bg-background px-3 text-sm text-foreground"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate({ q: "", missing: "", sort: "" })}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
