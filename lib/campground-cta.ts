import { createSupabaseAdminClient } from "./supabase/server";

// Re-export from the shared, client-safe variants file.
export { CTA_VARIANTS, type CtaVariant } from "./cta-variants";

export type CtaCampground = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  campground_type: string | null;
};

export async function getCtaCampgrounds(limit = 3): Promise<CtaCampground[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("campgrounds")
    .select("id, name, slug, city, state, campground_type, is_featured")
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  return data.map((campground) => ({
    id: String(campground.id),
    name: String(campground.name),
    slug: String(campground.slug),
    city: campground.city ? String(campground.city) : null,
    state: campground.state ? String(campground.state) : null,
    campground_type: campground.campground_type ? String(campground.campground_type) : null,
  }));
}

