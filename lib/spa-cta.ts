import { createSupabaseAdminClient } from "./supabase/server";
import { getFirstGalleryImageUrls } from "./spa-images";

// Re-export from the shared, client-safe variants file
export { CTA_VARIANTS, type CtaVariant } from "./cta-variants";

export type CtaSpa = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  image_url: string | null;
};

/**
 * Fetch a small set of published spas with images for use inside guide CTA cards.
 * Featured spas are prioritised; falls back to alphabetical order.
 */
export async function getCtaSpas(limit = 3): Promise<CtaSpa[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("spas")
    .select("id, name, slug, city, state, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(limit * 4); // Fetch more than needed so we can filter to those with images

  if (error || !data || data.length === 0) return [];

  const spaIds = data.map((s) => String(s.id));
  const imageMap = await getFirstGalleryImageUrls(spaIds);

  // Prefer spas that have images
  const withImages = data.filter((s) => imageMap.has(String(s.id)));
  const candidates = withImages.length >= limit ? withImages : [...withImages, ...data.filter((s) => !imageMap.has(String(s.id)))];

  return candidates.slice(0, limit).map((spa) => ({
    id: String(spa.id),
    name: String(spa.name),
    slug: String(spa.slug),
    city: spa.city ? String(spa.city) : null,
    state: spa.state ? String(spa.state) : null,
    image_url: imageMap.get(String(spa.id)) ?? null,
  }));
}
