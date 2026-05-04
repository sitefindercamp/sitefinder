import type { MetadataRoute } from "next";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BASE_URL = "https://sitefinder.camp";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseAdminClient();

  const { data: campgrounds, error: campgroundsError } = await supabase
    .from("campgrounds")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  // Fetch all published blog posts and guides
  const { data: posts, error: postsError } = await supabase
    .from("blog_posts")
    .select("slug, post_type, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const campgroundRows = campgroundsError ? [] : campgrounds ?? [];
  const postRows = postsError ? [] : posts ?? [];

  const campgroundUrls: MetadataRoute.Sitemap = campgroundRows.map((campground) => ({
    url: `${BASE_URL}/campgrounds/${campground.slug}`,
    lastModified: campground.updated_at ? new Date(campground.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postUrls: MetadataRoute.Sitemap = postRows.map((post) => {
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
    { url: `${BASE_URL}/campgrounds`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/guides`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE_URL}/blog`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/advertise`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/submit`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/terms`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];

  return [...staticUrls, ...campgroundUrls, ...postUrls];
}
