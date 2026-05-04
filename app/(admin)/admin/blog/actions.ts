"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostById,
  updateBlogPost,
  type BlogPostStatus,
  type BlogPostType,
} from "@/lib/blog-posts";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

// ── Featured image upload ─────────────────────────────────────────

export async function uploadFeaturedImageAction(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided." };

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `featured/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from("Website")
    .upload(filename, buffer, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const { data } = supabase.storage.from("Website").getPublicUrl(filename);
  return { url: data.publicUrl };
}

// ── Shared helpers ────────────────────────────────────────────────

function extractPostFields(formData: FormData) {
  const audienceRaw = (formData.get("audience_tags") as string | null) ?? "";
  const audience_tags = audienceRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: (formData.get("title") as string | null)?.trim() ?? "",
    slug: (formData.get("slug") as string | null)?.trim() ?? "",
    excerpt: (formData.get("excerpt") as string | null)?.trim() || null,
    content: (formData.get("content") as string | null) || null,
    post_type: ((formData.get("post_type") as string | null) ?? "guide") as BlogPostType,
    featured_image_url: (formData.get("featured_image_url") as string | null)?.trim() || null,
    audience_tags,
  };
}

// ── Create ────────────────────────────────────────────────────────

async function _createPost(formData: FormData, status: BlogPostStatus) {
  const { title, slug, excerpt, content, post_type, featured_image_url, audience_tags } = extractPostFields(formData);

  if (!title) redirect("/admin/blog/new?error=Title+is+required" as Route);

  let post: Awaited<ReturnType<typeof createBlogPost>> | null = null;
  let errorMsg: string | null = null;

  try {
    post = await createBlogPost({ title, slug: slug || undefined, excerpt, content, status, post_type, featured_image_url, audience_tags });
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to create post";
  }

  if (errorMsg || !post) {
    redirect(("/admin/blog/new?error=" + encodeURIComponent(errorMsg ?? "Failed to create post")) as Route);
  }

  revalidatePath("/admin/blog" as Route);
  revalidatePath("/guides" as Route);
  revalidatePath("/blog" as Route);
  redirect((`/admin/blog/${post.id}`) as Route);
}

export async function createBlogPostAsDraftAction(formData: FormData) {
  await _createPost(formData, "draft");
}

export async function createBlogPostAsPublishedAction(formData: FormData) {
  await _createPost(formData, "published");
}

// ── Update ────────────────────────────────────────────────────────

async function _updatePost(formData: FormData, status: BlogPostStatus) {
  const id = formData.get("id") as string;
  const { title, slug, excerpt, content, post_type, featured_image_url, audience_tags } = extractPostFields(formData);

  if (!id || !title) redirect((`/admin/blog/${id}?error=Title+is+required`) as Route);

  const existing = await getBlogPostById(id);
  if (!existing) redirect("/admin/blog" as Route);

  let errorMsg: string | null = null;

  try {
    await updateBlogPost(id, {
      title,
      slug: slug || title,
      excerpt,
      content,
      status,
      post_type,
      featured_image_url,
      audience_tags,
      previousStatus: existing.status,
      previousPublishedAt: existing.published_at,
    });
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "Failed to save post";
  }

  if (errorMsg) {
    redirect((`/admin/blog/${id}?error=` + encodeURIComponent(errorMsg)) as Route);
  }

  revalidatePath("/admin/blog" as Route);
  revalidatePath((`/admin/blog/${id}`) as Route);
  revalidatePath("/guides" as Route);
  revalidatePath("/blog" as Route);
  if (existing.slug) {
    revalidatePath((`/guides/${existing.slug}`) as Route);
    revalidatePath((`/blog/${existing.slug}`) as Route);
  }
  redirect((`/admin/blog/${id}?success=1`) as Route);
}

export async function updateBlogPostAsDraftAction(formData: FormData) {
  await _updatePost(formData, "draft");
}

export async function updateBlogPostAsPublishedAction(formData: FormData) {
  await _updatePost(formData, "published");
}

// ── Delete ────────────────────────────────────────────────────────

export async function deleteBlogPostAction(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) redirect("/admin/blog" as Route);

  try {
    await deleteBlogPost(id);
    revalidatePath("/admin/blog" as Route);
    revalidatePath("/guides" as Route);
    revalidatePath("/blog" as Route);
  } catch {
    // best-effort
  }

  redirect("/admin/blog?deleted=1" as Route);
}
