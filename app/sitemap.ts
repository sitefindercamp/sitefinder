import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { stateToSlug, cityToSlug } from "@/lib/us-locations";

const BASE_URL = "https://sitefinder.camp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient();

  // Fetch all published spas (slug + location for building location page URLs)
  const { data: spas } = await supabase
    .from("spas")
    .select("slug, city, state, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  // Fetch all published blog posts and guides
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, post_type, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const spaUrls: MetadataRoute.Sitemap = (spas ?? []).map((spa) => ({
    url: `${BASE_URL}/spas/${spa.slug}`,
    lastModified: spa.updated_at ? new Date(spa.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Derive unique state and city location pages from published spa data
  const stateSlugsSeen = new Set<string>();
  const citySlugsSeen = new Set<string>();

  for (const spa of spas ?? []) {
    if (spa.state) {
      const slug = stateToSlug(spa.state);
      if (slug) stateSlugsSeen.add(slug);
    }
    if (spa.city) {
      citySlugsSeen.add(cityToSlug(spa.city));
    }
  }

  const stateUrls: MetadataRoute.Sitemap = [...stateSlugsSeen].map((slug) => ({
    url: `${BASE_URL}/spas/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const cityUrls: MetadataRoute.Sitemap = [...citySlugsSeen].map((slug) => ({
    url: `${BASE_URL}/spas/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const postUrls: MetadataRoute.Sitemap = (posts ?? []).map((post) => {
    const section = post.post_type === "guide" ? "guides" : "blog";
    return {
      url: `${BASE_URL}/${section}/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: "monthly",
      priority: post.post_type === "guide" ? 0.7 : 0.6,
    };
  });

  const staticUrls: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/spas`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/guides`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/blog`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/advertise`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/submit`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];

  return [...staticUrls, ...stateUrls, ...cityUrls, ...spaUrls, ...postUrls];
}
