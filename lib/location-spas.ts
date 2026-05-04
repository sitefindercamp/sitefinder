import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { SPA_IMAGE_BUCKET } from "@/lib/spa-images";
import { US_STATE_BY_SLUG, US_STATE_BY_ABBR, cityToSlug } from "@/lib/us-locations";

export type LocationSpa = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  summary: string | null;
  is_featured: boolean;
  listing_categories: string[];
  featured_image_url: string | null;
  review_count: number;
};

export type CityEntry = {
  city: string;
  citySlug: string;
  count: number;
};

const SPA_SELECT = "id, slug, name, city, state, summary, is_featured, listing_categories";

function toLocationSpa(row: Record<string, unknown>): LocationSpa {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    city: typeof row.city === "string" ? row.city : "",
    state: typeof row.state === "string" ? row.state : null,
    summary: typeof row.summary === "string" ? row.summary : null,
    is_featured: Boolean(row.is_featured),
    listing_categories: Array.isArray(row.listing_categories)
      ? (row.listing_categories as unknown[]).map(String)
      : [],
    featured_image_url: null,
    review_count: 0,
  };
}

async function attachCardMeta(spas: LocationSpa[]): Promise<LocationSpa[]> {
  if (spas.length === 0) return spas;

  const supabase = createSupabaseAdminClient();
  const ids = spas.map((s) => s.id);

  const [{ data: imageRows }, { data: reviewRows }] = await Promise.all([
    supabase
      .from("spa_images")
      .select("spa_id, storage_path")
      .eq("kind", "gallery")
      .in("spa_id", ids)
      .order("sort_order", { ascending: true }),
    supabase
      .from("spa_reviews")
      .select("spa_id")
      .eq("status", "approved")
      .in("spa_id", ids),
  ]);

  // Map of first gallery image per spa
  const imageMap = new Map<string, string>();
  for (const row of (imageRows ?? []) as Array<Record<string, unknown>>) {
    const spaId = typeof row.spa_id === "string" ? row.spa_id : null;
    const storagePath = typeof row.storage_path === "string" ? row.storage_path : null;
    if (!spaId || !storagePath || imageMap.has(spaId)) continue;
    const { data } = supabase.storage.from(SPA_IMAGE_BUCKET).getPublicUrl(storagePath);
    imageMap.set(spaId, data.publicUrl);
  }

  // Count approved reviews per spa
  const reviewCount = new Map<string, number>();
  for (const row of (reviewRows ?? []) as Array<Record<string, unknown>>) {
    const spaId = typeof row.spa_id === "string" ? row.spa_id : null;
    if (!spaId) continue;
    reviewCount.set(spaId, (reviewCount.get(spaId) ?? 0) + 1);
  }

  return spas.map((spa) => ({
    ...spa,
    featured_image_url: imageMap.get(spa.id) ?? null,
    review_count: reviewCount.get(spa.id) ?? 0,
  }));
}

/**
 * Resolves a URL slug to a canonical state name for DB querying.
 * Handles full-name slugs ("california") and abbreviations ("CA").
 * Returns null if not a known state.
 */
export function resolveStateFromSlug(slug: string): { name: string; abbr: string } | null {
  const bySlug = US_STATE_BY_SLUG.get(slug);
  if (bySlug) return { name: bySlug.name, abbr: bySlug.abbr };

  const byAbbr = US_STATE_BY_ABBR.get(slug.toUpperCase());
  if (byAbbr) return { name: byAbbr.name, abbr: byAbbr.abbr };

  return null;
}

/**
 * Fetch all published spas in a state.
 * Matches both full state name and abbreviation in the DB.
 */
export async function getSpasByState(stateName: string, stateAbbr: string): Promise<LocationSpa[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("spas")
    .select(SPA_SELECT)
    .eq("status", "published")
    .or(`state.ilike.${stateName},state.ilike.${stateAbbr}`)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load spas by state: ${error.message}`);

  const spas = ((data ?? []) as unknown as Array<Record<string, unknown>>).map(toLocationSpa);
  return attachCardMeta(spas);
}

/**
 * Fetch all published spas in a city (case-insensitive).
 * Returns empty array if no spas found.
 */
export async function getSpasByCity(cityName: string): Promise<LocationSpa[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("spas")
    .select(SPA_SELECT)
    .eq("status", "published")
    .ilike("city", cityName)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw new Error(`Failed to load spas by city: ${error.message}`);

  const spas = ((data ?? []) as unknown as Array<Record<string, unknown>>).map(toLocationSpa);
  return attachCardMeta(spas);
}

/**
 * Returns unique cities within a state with spa counts, sorted alphabetically.
 */
export async function getCitiesInState(
  stateName: string,
  stateAbbr: string
): Promise<CityEntry[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("spas")
    .select("city")
    .eq("status", "published")
    .or(`state.ilike.${stateName},state.ilike.${stateAbbr}`);

  if (error) throw new Error(`Failed to load cities for state: ${error.message}`);

  const countMap = new Map<string, number>();
  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const city = typeof row.city === "string" ? row.city.trim() : null;
    if (!city) continue;
    countMap.set(city, (countMap.get(city) ?? 0) + 1);
  }

  return [...countMap.entries()]
    .map(([city, count]) => ({ city, citySlug: cityToSlug(city), count }))
    .sort((a, b) => a.city.localeCompare(b.city));
}
