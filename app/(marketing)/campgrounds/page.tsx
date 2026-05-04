import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";

import { CampgroundCard } from "@/components/campgrounds/campground-card";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  listCampgroundFilterOptions,
  listPublishedCampgrounds,
  type CampgroundFilters,
  type CampgroundFilterOptions,
} from "@/lib/campgrounds";
import { CAMPGROUND_AMENITIES, type Campground, type CampgroundAmenityKey } from "@/types/campground";

const PAGE_SIZE = 24;
const AMENITY_KEYS = new Set(CAMPGROUND_AMENITIES.map((amenity) => amenity.key));

export const metadata = {
  title: "Browse RV Parks & Campgrounds",
  description:
    "Search SiteFinder.Camp for RV parks and campgrounds by state, city, campground type, and amenities.",
};

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function allParams(value: string | string[] | undefined) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function cleanParam(value: string | string[] | undefined) {
  return firstParam(value).trim().slice(0, 120);
}

function parseAmenities(value: string | string[] | undefined): CampgroundAmenityKey[] {
  return allParams(value)
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter((item): item is CampgroundAmenityKey => AMENITY_KEYS.has(item as CampgroundAmenityKey));
}

function parsePage(value: string | string[] | undefined) {
  const page = Number.parseInt(firstParam(value), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function buildPageUrl(filters: CampgroundFilters, targetPage: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.state) params.set("state", filters.state);
  if (filters.city) params.set("city", filters.city);
  if (filters.campground_type) params.set("campground_type", filters.campground_type);
  filters.amenities.forEach((amenity) => params.append("amenities", amenity));
  if (targetPage > 1) params.set("page", String(targetPage));
  const query = params.toString();
  return query ? `/campgrounds?${query}` : "/campgrounds";
}

function SelectField({
  label,
  name,
  value,
  options,
  placeholder,
}: {
  label: string;
  name: keyof Pick<CampgroundFilters, "state" | "city" | "campground_type">;
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
        className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

function Pagination({
  page,
  totalPages,
  filters,
}: {
  page: number;
  totalPages: number;
  filters: CampgroundFilters;
}) {
  if (totalPages <= 1) return null;
  const linkClass =
    "inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary";
  const disabledClass =
    "inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-muted-foreground/50";

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={buildPageUrl(filters, page - 1) as Route} className={linkClass}>
          Previous
        </Link>
      ) : (
        <span className={disabledClass}>Previous</span>
      )}
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={buildPageUrl(filters, page + 1) as Route} className={linkClass}>
          Next
        </Link>
      ) : (
        <span className={disabledClass}>Next</span>
      )}
    </nav>
  );
}

export default async function CampgroundsPage({ searchParams }: Props) {
  noStore();

  const params = await searchParams;
  const page = parsePage(params?.page);
  const filters: CampgroundFilters = {
    q: cleanParam(params?.q),
    state: cleanParam(params?.state),
    city: cleanParam(params?.city),
    campground_type: cleanParam(params?.campground_type),
    amenities: parseAmenities(params?.amenities),
  };

  let filterOptions: CampgroundFilterOptions = { states: [], cities: [], campgroundTypes: [] };
  let result: { campgrounds: Campground[]; totalCount: number } = { campgrounds: [], totalCount: 0 };
  let loadError = false;

  try {
    [filterOptions, result] = await Promise.all([
      listCampgroundFilterOptions(),
      listPublishedCampgrounds(filters, page, PAGE_SIZE),
    ]);
  } catch (error) {
    loadError = true;
    console.error("Failed to load campground directory", error);
  }

  const totalPages = Math.max(1, Math.ceil(result.totalCount / PAGE_SIZE));

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-8">
        <PageIntro
          eyebrow="Campground Directory"
          title="Find RV parks and campgrounds"
          description="Search by location, campground type, and practical RV amenities from the SiteFinder.Camp database."
        />

        <Card className="rounded-lg">
          <CardContent className="p-5">
            <form className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" action="/campgrounds">
              <div className="flex flex-col gap-2">
                <Label htmlFor="q">Search</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="q"
                    name="q"
                    defaultValue={filters.q}
                    placeholder="Name, city, zip, or type"
                    className="pl-9"
                  />
                </div>
              </div>

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
              <SelectField
                label="Type"
                name="campground_type"
                value={filters.campground_type}
                options={filterOptions.campgroundTypes}
                placeholder="Any type"
              />

              <div className="flex items-end gap-2">
                <Button type="submit" className="w-full lg:w-auto">
                  <SlidersHorizontal data-icon="inline-start" />
                  Filter
                </Button>
                <Button asChild variant="ghost" className="w-full lg:w-auto">
                  <Link href={"/campgrounds" as Route}>
                    <X data-icon="inline-start" />
                    Clear
                  </Link>
                </Button>
              </div>

              <fieldset className="grid gap-3 border-t border-border pt-4 lg:col-span-5">
                <legend className="mb-1 text-sm font-medium text-foreground">Amenities</legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {CAMPGROUND_AMENITIES.map((amenity) => (
                    <label key={amenity.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="amenities"
                        value={amenity.key}
                        defaultChecked={filters.amenities.includes(amenity.key)}
                        className="size-4 rounded border-input"
                      />
                      {amenity.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {loadError
              ? "Campground listings are temporarily unavailable"
              : `${result.totalCount.toLocaleString()} campground${result.totalCount === 1 ? "" : "s"} found`}
          </p>
          <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            Showing published SiteFinder listings
          </p>
        </div>

        {result.campgrounds.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.campgrounds.map((campground) => (
              <CampgroundCard key={campground.id} campground={campground} />
            ))}
          </div>
        ) : (
          <Card className="rounded-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold">
                {loadError ? "Unable to load campgrounds" : "No campgrounds found"}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {loadError
                  ? "Please refresh the page in a moment."
                  : "Try clearing a filter or searching a wider area."}
              </p>
            </CardContent>
          </Card>
        )}

        <Pagination page={page} totalPages={totalPages} filters={filters} />
      </div>
    </Container>
  );
}
