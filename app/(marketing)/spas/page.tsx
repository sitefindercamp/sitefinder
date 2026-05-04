/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowUpRight, MapPin, Search, Star, X } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SPA_IMAGE_BUCKET } from "@/lib/spa-images";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";
import { getActiveSponsoredSpas, getActiveFeaturedListings } from "@/lib/ad-campaigns";
import { SponsoredCard } from "@/components/ads/sponsored-card";
import { FeaturedListingCard } from "@/components/ads/featured-listing-card";
import { cn } from "@/lib/utils";
import { ImpressionTracker } from "@/components/ads/impression-tracker";
import { NearMeButton } from "@/components/spas/near-me-button";

type SpasPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PublishedSpa = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  summary: string | null;
  is_featured: boolean;
  listing_categories: string[];
  featured_image_url: string | null;
  review_count: number;
  review_average: number;
};

type FilterOptions = {
  countries: string[];
  states: string[];
  cities: string[];
};

type DirectoryFilters = {
  country: string;
  state: string;
  city: string;
  postal_code: string;
  q: string;
};

const SPA_SELECT: string =
  "id, slug, name, city, state, postal_code, country, summary, is_featured, listing_categories";
const FILTER_OPTION_SELECT: string = "country, state, city";
const PAGE_SIZE = 18;

// ── Proximity helpers (used for near-me fallback) ─────────────────────────────

// Approximate geographic centroids for US states + Canadian provinces.
// Good enough to sort "which state is closest" without per-spa coordinates.
const STATE_CENTROIDS: Record<string, [number, number]> = {
  Alabama: [32.8, -86.8], Alaska: [64.2, -153.4], Arizona: [34.3, -111.1],
  Arkansas: [34.8, -92.2], California: [37.2, -119.5], Colorado: [38.9, -105.5],
  Connecticut: [41.6, -72.7], Delaware: [38.9, -75.5], Florida: [27.8, -81.7],
  Georgia: [32.7, -83.4], Hawaii: [20.3, -156.4], Idaho: [44.4, -114.5],
  Illinois: [40.1, -89.2], Indiana: [39.9, -86.3], Iowa: [42.0, -93.2],
  Kansas: [38.5, -98.4], Kentucky: [37.5, -85.3], Louisiana: [30.9, -91.8],
  Maine: [45.3, -69.0], Maryland: [38.8, -77.0], Massachusetts: [42.3, -71.8],
  Michigan: [44.2, -85.5], Minnesota: [46.4, -93.1], Mississippi: [32.7, -89.6],
  Missouri: [38.5, -92.5], Montana: [46.9, -110.5], Nebraska: [41.5, -99.8],
  Nevada: [39.3, -116.6], "New Hampshire": [43.7, -71.6], "New Jersey": [40.1, -74.5],
  "New Mexico": [34.5, -106.0], "New York": [42.9, -75.5], "North Carolina": [35.6, -79.8],
  "North Dakota": [47.5, -100.5], Ohio: [40.4, -82.9], Oklahoma: [35.6, -97.5],
  Oregon: [44.1, -120.5], Pennsylvania: [40.9, -77.8], "Rhode Island": [41.7, -71.5],
  "South Carolina": [33.9, -81.0], "South Dakota": [44.4, -100.2], Tennessee: [35.9, -86.4],
  Texas: [31.5, -99.3], Utah: [39.3, -111.1], Vermont: [44.1, -72.7],
  Virginia: [37.8, -78.2], Washington: [47.4, -120.5], "West Virginia": [38.6, -80.5],
  Wisconsin: [44.3, -90.0], Wyoming: [43.1, -107.6], "District of Columbia": [38.9, -77.0],
  // Canada
  Ontario: [51.3, -85.3], "British Columbia": [53.7, -127.6],
  Quebec: [53.0, -70.6], Alberta: [53.9, -116.6], Manitoba: [55.0, -97.1],
  Saskatchewan: [55.0, -106.0], "Nova Scotia": [45.0, -63.0],
};

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function sortByProximity(spas: PublishedSpa[], userLat: number, userLng: number) {
  return [...spas].sort((a, b) => {
    const ca = STATE_CENTROIDS[a.state ?? ""];
    const cb = STATE_CENTROIDS[b.state ?? ""];
    const da = ca ? haversineKm(userLat, userLng, ca[0], ca[1]) : Infinity;
    const db = cb ? haversineKm(userLat, userLng, cb[0], cb[1]) : Infinity;
    return da - db;
  });
}

// totalCount = full proximity-sorted list length; spas = all of them (page
// component slices the current window in memory so proximity order is kept).
type NearMeFallback = { spas: PublishedSpa[]; totalCount: number; message: string } | null;

async function getNearMeFallback(
  filters: DirectoryFilters,
  userLat: number,
  userLng: number,
): Promise<NearMeFallback> {
  const locationLabel = [filters.city, filters.state].filter(Boolean).join(", ");

  // Try 1: broaden to state-only (drop city/postal/text). Pass no page so we
  // get all matching rows — proximity sort needs the full set.
  if (filters.state) {
    const { spas: stateSpas } = await getPublishedSpas({
      country: filters.country,
      state: filters.state,
      city: "",
      postal_code: "",
      q: "",
    });
    if (stateSpas.length > 0) {
      const sorted = sortByProximity(stateSpas, userLat, userLng);
      return {
        spas: sorted,
        totalCount: sorted.length,
        message: `No Korean spas in ${locationLabel} yet — showing the closest listings in ${filters.state}.`,
      };
    }
  }

  // Try 2: all published spas, sorted by proximity
  const { spas: allSpas } = await getPublishedSpas({ country: "", state: "", city: "", postal_code: "", q: "" });
  if (allSpas.length > 0) {
    const sorted = sortByProximity(allSpas, userLat, userLng);
    return {
      spas: sorted,
      totalCount: sorted.length,
      message: `No Korean spas near ${locationLabel || "your location"} yet — here are the closest listings we have.`,
    };
  }

  return null;
}

export const metadata = {
  title: "Browse Korean Spas & Jjimjilbangs",
  description:
    "Find Korean spas, jjimjilbangs, and bathhouses near you. Browse listings by city, state, and amenities — with hours, pricing, reviews, and day pass info.",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function cleanParam(value: string | string[] | undefined) {
  return firstParam(value).trim().slice(0, 120);
}

function cleanSearchTerm(value: string) {
  return value.replace(/[^a-zA-Z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueSorted(values: Array<unknown>) {
  return [...new Set(
    values
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function toPublishedSpa(row: Record<string, unknown>): PublishedSpa {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    city: String(row.city),
    state: typeof row.state === "string" ? row.state : null,
    postal_code: typeof row.postal_code === "string" ? row.postal_code : null,
    country: typeof row.country === "string" ? row.country : null,
    summary: typeof row.summary === "string" ? row.summary : null,
    is_featured: Boolean(row.is_featured),
    listing_categories: Array.isArray(row.listing_categories)
      ? row.listing_categories.map((value) => String(value))
      : [],
    featured_image_url: null,
    review_count: 0,
    review_average: 0,
  };
}

async function getSpaCardMeta(spaIds: string[]) {
  const meta = new Map<
    string,
    { featured_image_url: string | null; review_count: number; review_average: number }
  >();

  spaIds.forEach((spaId) => {
    meta.set(spaId, { featured_image_url: null, review_count: 0, review_average: 0 });
  });

  if (spaIds.length === 0) {
    return meta;
  }

  const supabase = createSupabaseAdminClient();
  const { data: imageRows } = await supabase
    .from("spa_images")
    .select("spa_id, storage_path, sort_order")
    .eq("kind", "gallery")
    .in("spa_id", spaIds)
    .order("sort_order", { ascending: true });

  for (const row of (imageRows ?? []) as Array<Record<string, unknown>>) {
    const spaId = typeof row.spa_id === "string" ? row.spa_id : null;
    const storagePath =
      typeof row.storage_path === "string" ? row.storage_path : null;

    if (!spaId || !storagePath || meta.get(spaId)?.featured_image_url) {
      continue;
    }

    const { data } = supabase.storage
      .from(SPA_IMAGE_BUCKET)
      .getPublicUrl(storagePath);

    meta.set(spaId, {
      review_count: meta.get(spaId)?.review_count ?? 0,
      review_average: meta.get(spaId)?.review_average ?? 0,
      featured_image_url: data.publicUrl,
    });
  }

  const { data: reviewRows, error: reviewError } = await supabase
    .from("spa_reviews")
    .select("spa_id, rating")
    .eq("status", "approved")
    .in("spa_id", spaIds);

  if (!reviewError) {
    // Accumulate totals per spa then compute averages
    const ratingTotals = new Map<string, { sum: number; count: number }>();

    for (const row of (reviewRows ?? []) as Array<Record<string, unknown>>) {
      const spaId = typeof row.spa_id === "string" ? row.spa_id : null;
      const rating = typeof row.rating === "number" ? row.rating : null;
      if (!spaId || rating === null) continue;

      const prev = ratingTotals.get(spaId) ?? { sum: 0, count: 0 };
      ratingTotals.set(spaId, { sum: prev.sum + rating, count: prev.count + 1 });
    }

    for (const [spaId, { sum, count }] of ratingTotals) {
      const current = meta.get(spaId) ?? {
        featured_image_url: null,
        review_count: 0,
        review_average: 0,
      };
      meta.set(spaId, {
        ...current,
        review_count: count,
        review_average: count > 0 ? sum / count : 0,
      });
    }
  }

  return meta;
}

async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select(FILTER_OPTION_SELECT)
    .eq("status", "published");

  if (error) {
    throw new Error(`Failed to load spa filter options: ${error.message}`);
  }

  const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;

  return {
    countries: uniqueSorted(rows.map((row) => row.country)),
    states: uniqueSorted(rows.map((row) => row.state)),
    cities: uniqueSorted(rows.map((row) => row.city)),
  };
}

async function getPublishedSpas(
  filters: DirectoryFilters,
  page?: number,
): Promise<{ spas: PublishedSpa[]; totalCount: number }> {
  const supabase = await createSupabaseServerClient();
  // count:"exact" returns total matching rows alongside the page data
  let query = supabase
    .from("spas")
    .select(SPA_SELECT, { count: "exact" })
    .eq("status", "published");

  if (filters.country) query = query.ilike("country", filters.country);
  if (filters.state)   query = query.ilike("state", filters.state);
  if (filters.city)    query = query.ilike("city", filters.city);
  if (filters.postal_code) query = query.ilike("postal_code", `${filters.postal_code}%`);

  const searchTerm = cleanSearchTerm(filters.q);
  if (searchTerm) {
    const p = `%${searchTerm}%`;
    query = query.or(
      [`name.ilike.${p}`, `city.ilike.${p}`, `state.ilike.${p}`, `postal_code.ilike.${p}`, `country.ilike.${p}`].join(",")
    );
  }

  const ordered = query
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  const { data, error, count } =
    page !== undefined
      ? await ordered.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      : await ordered;

  if (error) throw new Error(`Failed to load spas: ${error.message}`);

  const spas = ((data ?? []) as unknown as Array<Record<string, unknown>>).map(toPublishedSpa);
  const cardMeta = await getSpaCardMeta(spas.map((s) => s.id));

  return {
    spas: spas.map((s) => ({ ...s, ...(cardMeta.get(s.id) ?? {}) })),
    totalCount: count ?? spas.length,
  };
}

function SelectField({
  label,
  name,
  value,
  options,
  placeholder,
}: {
  label: string;
  name: keyof DirectoryFilters;
  value: string;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={value}
        className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Pagination helpers ────────────────────────────────────────────────────────

function buildPageUrl(
  filters: DirectoryFilters,
  extras: Record<string, string>,
  targetPage: number,
): string {
  const p = new URLSearchParams();
  if (filters.q)           p.set("q", filters.q);
  if (filters.country)     p.set("country", filters.country);
  if (filters.state)       p.set("state", filters.state);
  if (filters.city)        p.set("city", filters.city);
  if (filters.postal_code) p.set("postal_code", filters.postal_code);
  for (const [k, v] of Object.entries(extras)) if (v) p.set(k, v);
  if (targetPage > 1) p.set("page", String(targetPage));
  const qs = p.toString();
  return qs ? `/spas?${qs}` : "/spas";
}

function pageNumbers(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "…"> = [1];
  if (current - 2 > 2)       out.push("…");
  for (let n = Math.max(2, current - 2); n <= Math.min(total - 1, current + 2); n++) out.push(n);
  if (current + 2 < total - 1) out.push("…");
  if (total > 1) out.push(total);
  return out;
}

function PaginationNav({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      {/* Previous */}
      {page > 1 ? (
        <Link
          href={buildHref(page - 1) as Route}
          className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          ← Prev
        </Link>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none">
          ← Prev
        </span>
      )}

      {/* Page numbers */}
      {pageNumbers(page, totalPages).map((n, i) =>
        n === "…" ? (
          <span key={`ellipsis-${i}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : n === page ? (
          <span
            key={n}
            aria-current="page"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
          >
            {n}
          </span>
        ) : (
          <Link
            key={n}
            href={buildHref(n) as Route}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            {n}
          </Link>
        )
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link
          href={buildHref(page + 1) as Route}
          className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          Next →
        </Link>
      ) : (
        <span className="flex h-9 items-center gap-1 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground/40 cursor-not-allowed select-none">
          Next →
        </span>
      )}
    </nav>
  );
}

export default async function SpasPage({ searchParams }: SpasPageProps) {
  noStore();

  const params = await searchParams;
  const filters: DirectoryFilters = {
    country: cleanParam(params?.country),
    state: cleanParam(params?.state),
    city: cleanParam(params?.city),
    postal_code: cleanParam(params?.postal_code),
    q: cleanParam(params?.q),
  };

  const isNearMe = cleanParam(params?.nearme) === "1";
  const nearMeRaw = cleanParam(params?.lat);
  const userLat = parseFloat(nearMeRaw);
  const userLng = parseFloat(cleanParam(params?.lng));
  const nearMeExtras: Record<string, string> = isNearMe
    ? { nearme: "1", lat: cleanParam(params?.lat), lng: cleanParam(params?.lng) }
    : {};

  // Clamp page to a valid positive integer (reset to 1 on filter change naturally,
  // since the form action doesn't carry the page param forward).
  const page = Math.max(1, parseInt(cleanParam(params?.page) || "1", 10));

  const hasFilters = Object.values(filters).some(Boolean);
  const [{ spas, totalCount: rawTotal }, filterOptions, sponsoredCampaigns, featuredListings] = await Promise.all([
    getPublishedSpas(filters, page),
    getFilterOptions(),
    getActiveSponsoredSpas(),
    getActiveFeaturedListings(),
  ]);
  const sponsoredSlice = sponsoredCampaigns.slice(0, 3);

  // Near-me progressive fallback: when geolocation found nothing, broaden scope
  // and sort by approximate distance so users aren't left with an empty page.
  let nearMeFallback: NearMeFallback = null;
  if (isNearMe && spas.length === 0 && !isNaN(userLat) && !isNaN(userLng)) {
    nearMeFallback = await getNearMeFallback(filters, userLat, userLng);
  }

  // The list we'll actually render — fallback is paginated in-memory (proximity
  // sort must happen over the full set, so DB-level pagination can't be used).
  const totalCount   = nearMeFallback ? nearMeFallback.totalCount : rawTotal;
  const totalPages   = Math.ceil(totalCount / PAGE_SIZE);
  const displaySpas  = nearMeFallback
    ? nearMeFallback.spas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : spas;

  const hrefForPage = (p: number) => buildPageUrl(filters, nearMeExtras, p);

  return (
    <Container className="py-16">
      <PageIntro
        eyebrow="Browse"
        title="Explore Korean spas by city and location."
        description="Search published spa listings by place, ZIP code, or spa name."
      />

      <form
        action="/spas"
        className="surface mt-10 grid gap-4 p-5 shadow-[0_18px_52px_-38px_rgba(0,0,0,0.35)]"
      >
        <div className="grid gap-4 lg:grid-cols-[1.35fr_repeat(4,minmax(0,1fr))]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="q">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="q"
                name="q"
                defaultValue={filters.q}
                placeholder="Spa name, city, state, ZIP, or country"
                className="pl-10"
              />
            </div>
          </div>

          <SelectField
            label="Country"
            name="country"
            value={filters.country}
            options={filterOptions.countries}
            placeholder="Any country"
          />
          <SelectField
            label="State"
            name="state"
            value={filters.state}
            options={filterOptions.states}
            placeholder="Any state"
          />
          <SelectField
            label="City"
            name="city"
            value={filters.city}
            options={filterOptions.cities}
            placeholder="Any city"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="postal_code">ZIP/Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              defaultValue={filters.postal_code}
              placeholder="92111"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "spa" : "spas"}{nearMeFallback ? " found nearby" : " found"}
          </p>
          <div className="flex flex-wrap gap-3">
            <NearMeButton />
            {hasFilters ? (
              <Button asChild variant="outline">
                <Link href="/spas">
                  <X data-icon="inline-start" className="size-4" />
                  Clear filters
                </Link>
              </Button>
            ) : null}
            <Button type="submit">
              Search spas
              <Search data-icon="inline-end" className="size-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Track impressions for all paid placements (sponsored + featured listings) */}
      {(sponsoredSlice.length > 0 || featuredListings.length > 0) && (
        <ImpressionTracker
          campaignIds={[
            ...sponsoredSlice.map((c) => c.id),
            ...featuredListings.map((c) => c.id),
          ]}
        />
      )}

      {sponsoredSlice.length > 0 && (
        <>
          <div className="mt-10">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sponsored
            </p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {sponsoredSlice.map((campaign) => (
                <SponsoredCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-8">
            <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              All listings
            </p>
          </div>
        </>
      )}

      {/* Near-me fallback banner */}
      {nearMeFallback && (
        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <MapPin className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">{nearMeFallback.message}</p>
            <p className="mt-1 text-xs text-amber-700">
              Want us to list a spa in your area?{" "}
              <Link href="/submit" className="underline underline-offset-2 hover:text-amber-900">
                Submit a listing →
              </Link>
            </p>
          </div>
        </div>
      )}

      {displaySpas.length === 0 ? (
        <div className="mt-10 surface p-10 text-center">
          <h2 className="text-2xl font-semibold">
            {isNearMe ? "No Korean spas found yet" : hasFilters ? "No spas match your filters" : "No spas yet"}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {isNearMe
              ? "We haven't found any Korean spas in our directory yet. Be the first to submit one!"
              : hasFilters
              ? "Try clearing a filter or searching a broader city, state, ZIP, or spa name."
              : "Published spa listings will appear here once they are added."}
          </p>
          {isNearMe && (
            <Link
              href="/submit"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Submit a spa listing
              <ArrowUpRight className="size-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Featured listing campaigns — pinned to top of organic results */}
          {!nearMeFallback && featuredListings.map((campaign) => (
            <FeaturedListingCard key={campaign.id} campaign={campaign} />
          ))}
          {displaySpas.map((spa) => (
            <Card key={spa.id} className="h-full overflow-hidden">
              {spa.featured_image_url ? (
                <Link href={`/spas/${spa.slug}` as Route} aria-label={spa.name}>
                  <img
                    src={spa.featured_image_url}
                    alt={`${spa.name} featured photo`}
                    className="h-48 w-full object-cover transition duration-300 hover:scale-[1.02]"
                  />
                </Link>
              ) : (
                <Link
                  href={`/spas/${spa.slug}` as Route}
                  aria-label={spa.name}
                  className="flex h-48 w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(14,108,93,0.18),transparent_34%),linear-gradient(135deg,#f4eee5,#fffaf3_48%,#edf4ef)]"
                >
                  <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    Kspa.online
                  </div>
                </Link>
              )}
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {spa.listing_categories[0] ? (
                      <Badge variant="secondary" className="rounded-full">
                        {spa.listing_categories[0]}
                      </Badge>
                    ) : null}
                    <CardTitle className="mt-2 text-xl">
                      <Link
                        href={`/spas/${spa.slug}` as Route}
                        className="hover:underline"
                      >
                        {spa.name}
                      </Link>
                    </CardTitle>
                    {spa.review_count > 0 ? (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "size-3.5",
                                star <= Math.round(spa.review_average)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-muted-foreground/20 text-muted-foreground/20"
                              )}
                            />
                          ))}
                        </div>
                        <span>{spa.review_average.toFixed(1)}</span>
                        <span className="text-muted-foreground/60">
                          ({spa.review_count}{" "}
                          {spa.review_count === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-muted-foreground/60">
                        No reviews yet
                      </p>
                    )}
                  </div>
                  <div className="rounded-full bg-secondary p-3">
                    <MapPin className="size-4 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-medium text-foreground">
                  {[spa.city, spa.state, spa.postal_code].filter(Boolean).join(", ")}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {spa.summary || "No summary available yet."}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/spas/${spa.slug}` as Route}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View details
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationNav page={page} totalPages={totalPages} buildHref={hrefForPage} />
    </Container>
  );
}
