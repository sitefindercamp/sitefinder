import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import type { Campground, CampgroundAmenityKey } from "@/types/campground";

const CAMPGROUND_SELECT = [
  "id",
  "slug",
  "status",
  "name",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "email",
  "website",
  "price_range",
  "campground_type",
  "full_hookups",
  "amp_30",
  "amp_50",
  "pull_through",
  "big_rig_friendly",
  "wifi",
  "laundry",
  "showers",
  "pool",
  "pet_friendly",
  "monthly_stays",
  "dump_station",
  "description",
  "is_featured",
].join(",");

export type CampgroundFilters = {
  q: string;
  state: string;
  city: string;
  campground_type: string;
  amenities: CampgroundAmenityKey[];
};

export type CampgroundFilterOptions = {
  states: string[];
  cities: string[];
  campgroundTypes: string[];
};

function cleanSearchTerm(value: string) {
  return value.replace(/[^a-zA-Z0-9\s.-]/g, " ").replace(/\s+/g, " ").trim();
}

function uniqueSorted(values: Array<unknown>) {
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}

function campgroundApiUrl(params: URLSearchParams) {
  const supabaseUrl = getSupabaseUrl().replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const url = new URL(`${supabaseUrl}/rest/v1/campgrounds`);
  params.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  return url;
}

async function fetchCampgroundRows(
  params: URLSearchParams,
  options?: { count?: boolean }
): Promise<{ rows: Array<Record<string, unknown>>; count: number | null }> {
  const response = await fetch(campgroundApiUrl(params), {
    headers: {
      apikey: getSupabaseAnonKey(),
      Authorization: `Bearer ${getSupabaseAnonKey()}`,
      ...(options?.count ? { Prefer: "count=exact" } : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to load campgrounds: ${response.status} ${body}`);
  }

  const rows = (await response.json()) as Array<Record<string, unknown>>;
  const contentRange = response.headers.get("content-range");
  const count = contentRange ? Number.parseInt(contentRange.split("/")[1] ?? "", 10) : null;

  return {
    rows,
    count: Number.isFinite(count) ? count : null,
  };
}

function toCampground(row: Record<string, unknown>): Campground {
  return {
    id: String(row.id),
    slug: String(row.slug),
    status: (row.status as Campground["status"] | undefined) ?? "draft",
    name: String(row.name ?? ""),
    address: typeof row.address === "string" ? row.address : null,
    city: String(row.city ?? ""),
    state: String(row.state ?? ""),
    zip: typeof row.zip === "string" ? row.zip : null,
    phone: typeof row.phone === "string" ? row.phone : null,
    email: typeof row.email === "string" ? row.email : null,
    website: typeof row.website === "string" ? row.website : null,
    price_range: typeof row.price_range === "string" ? row.price_range : null,
    campground_type: typeof row.campground_type === "string" ? row.campground_type : null,
    full_hookups: typeof row.full_hookups === "boolean" ? row.full_hookups : null,
    amp_30: typeof row.amp_30 === "boolean" ? row.amp_30 : null,
    amp_50: typeof row.amp_50 === "boolean" ? row.amp_50 : null,
    pull_through: typeof row.pull_through === "boolean" ? row.pull_through : null,
    big_rig_friendly: typeof row.big_rig_friendly === "boolean" ? row.big_rig_friendly : null,
    wifi: typeof row.wifi === "boolean" ? row.wifi : null,
    laundry: typeof row.laundry === "boolean" ? row.laundry : null,
    showers: typeof row.showers === "boolean" ? row.showers : null,
    pool: typeof row.pool === "boolean" ? row.pool : null,
    pet_friendly: typeof row.pet_friendly === "boolean" ? row.pet_friendly : null,
    monthly_stays: typeof row.monthly_stays === "boolean" ? row.monthly_stays : null,
    dump_station: typeof row.dump_station === "boolean" ? row.dump_station : null,
    description: typeof row.description === "string" ? row.description : null,
    is_featured: Boolean(row.is_featured),
  };
}

export async function listCampgroundFilterOptions(): Promise<CampgroundFilterOptions> {
  const params = new URLSearchParams({
    select: "state,city,campground_type",
    status: "eq.published",
    limit: "5000",
  });
  const { rows } = await fetchCampgroundRows(params);

  return {
    states: uniqueSorted(rows.map((row) => row.state)),
    cities: uniqueSorted(rows.map((row) => row.city)),
    campgroundTypes: uniqueSorted(rows.map((row) => row.campground_type)),
  };
}

export async function listPublishedCampgrounds(
  filters: CampgroundFilters,
  page: number,
  pageSize: number
): Promise<{ campgrounds: Campground[]; totalCount: number }> {
  const params = new URLSearchParams({
    select: CAMPGROUND_SELECT,
    status: "eq.published",
    order: "is_featured.desc,name.asc",
    offset: String((page - 1) * pageSize),
    limit: String(pageSize),
  });

  if (filters.state) params.set("state", `ilike.${filters.state}`);
  if (filters.city) params.set("city", `ilike.${filters.city}`);
  if (filters.campground_type) params.set("campground_type", `ilike.${filters.campground_type}`);

  filters.amenities.forEach((amenity) => params.set(amenity, "eq.true"));

  const searchTerm = cleanSearchTerm(filters.q);
  if (searchTerm) {
    const pattern = `%${searchTerm}%`;
    params.set(
      "or",
      `(${[
        `name.ilike.${pattern}`,
        `city.ilike.${pattern}`,
        `state.ilike.${pattern}`,
        `zip.ilike.${pattern}`,
        `campground_type.ilike.${pattern}`,
      ].join(",")})`
    );
  }

  const { rows, count } = await fetchCampgroundRows(params, { count: true });

  return {
    campgrounds: rows.map(toCampground),
    totalCount: count ?? 0,
  };
}

export async function getPublishedCampgroundBySlug(slug: string): Promise<Campground | null> {
  const params = new URLSearchParams({
    select: CAMPGROUND_SELECT,
    status: "eq.published",
    slug: `eq.${slug}`,
    limit: "1",
  });

  const { rows } = await fetchCampgroundRows(params);

  return rows[0] ? toCampground(rows[0]) : null;
}
