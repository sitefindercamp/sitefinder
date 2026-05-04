import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type BlogPostStatus = "draft" | "published";
export type BlogPostType = "guide" | "blog" | "page";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: BlogPostStatus;
  post_type: BlogPostType;
  featured_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  /** Guide-specific audience tags e.g. ["first-timers", "couples"] */
  audience_tags: string[];
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Admin (service-role) ──────────────────────────────────────────

export async function listAllBlogPosts(): Promise<BlogPost[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, status, post_type, featured_image_url, published_at, created_at, updated_at, audience_tags")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as BlogPost;
}

export async function createBlogPost(input: {
  title: string;
  slug?: string;
  excerpt: string | null;
  content: string | null;
  status: BlogPostStatus;
  post_type: BlogPostType;
  featured_image_url: string | null;
  audience_tags?: string[];
}): Promise<BlogPost> {
  const supabase = createSupabaseAdminClient();
  const slug = input.slug ? toSlug(input.slug) : toSlug(input.title);

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: input.title,
      slug,
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      post_type: input.post_type,
      featured_image_url: input.featured_image_url,
      audience_tags: input.audience_tags ?? [],
      published_at: input.status === "published" ? new Date().toISOString() : null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as BlogPost;
}

export async function updateBlogPost(
  id: string,
  input: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    status: BlogPostStatus;
    post_type: BlogPostType;
    featured_image_url: string | null;
    audience_tags: string[];
    previousStatus: BlogPostStatus;
    previousPublishedAt: string | null;
  }
): Promise<BlogPost> {
  const supabase = createSupabaseAdminClient();

  // Only set published_at the first time a post is published
  const published_at =
    input.status === "published"
      ? input.previousPublishedAt ?? new Date().toISOString()
      : null;

  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      title: input.title,
      slug: toSlug(input.slug),
      excerpt: input.excerpt,
      content: input.content,
      status: input.status,
      post_type: input.post_type,
      featured_image_url: input.featured_image_url,
      audience_tags: input.audience_tags,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as BlogPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Public ────────────────────────────────────────────────────────

export async function listPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, status, post_type, featured_image_url, published_at, created_at, updated_at, audience_tags")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
}

export async function listPublishedBlogPostsByType(
  type: BlogPostType,
  limit?: number
): Promise<BlogPost[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, status, post_type, featured_image_url, published_at, created_at, updated_at, audience_tags")
    .eq("status", "published")
    .eq("post_type", type)
    .order("published_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogPost[];
}

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data as BlogPost;
}
