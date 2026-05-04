import type { Route } from "next";
import { notFound } from "next/navigation";

import {
  updateBlogPostAsDraftAction,
  updateBlogPostAsPublishedAction,
} from "@/app/(admin)/admin/blog/actions";
import { AudienceTagPicker } from "@/components/admin/audience-tag-picker";
import { FeaturedImageUploader } from "@/components/admin/featured-image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBlogPostById } from "@/lib/blog-posts";

export const metadata = { title: "Edit Post | Admin" };

function publicUrlForPost(type: string, slug: string): string {
  if (type === "blog") return `/blog/${slug}`;
  if (type === "page") return `/p/${slug}`;
  return `/guides/${slug}`;
}

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function EditBlogPostPage({ params, searchParams }: Props) {
  const { id } = await params;
  const qp = await searchParams;
  const error = qp?.error ? decodeURIComponent(qp.error) : null;
  const success = qp?.success === "1";

  const post = await getBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-8">
      <PageIntro eyebrow="Admin · Blog" title="Edit post" description={`Editing: ${post.title}`} />

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>
            {post.status === "published" ? "Post published and live." : "Draft saved."}
          </span>
          {post.status === "published" && (
            <a
              href={publicUrlForPost(post.post_type, post.slug)}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-xl border border-green-300 bg-white px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-50"
            >
              View live ↗
            </a>
          )}
        </div>
      )}

      <form action={updateBlogPostAsDraftAction} className="flex flex-col gap-6">
        <input type="hidden" name="id" value={post.id} />

        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" defaultValue={post.title} required autoFocus />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={post.slug} placeholder="auto-generated from title if blank" />
            <p className="text-xs text-muted-foreground">URL: /{post.post_type === "blog" ? "blog" : post.post_type === "page" ? "p" : "guides"}/{post.slug}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="post_type">Type</Label>
            <select
              id="post_type"
              name="post_type"
              defaultValue={post.post_type}
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="guide">Guide</option>
              <option value="blog">Blog post</option>
              <option value="page">Page</option>
            </select>
          </div>

          {/* Current status shown as read-only badge — buttons below control draft vs published */}
          <div className="flex flex-col gap-2">
            <Label>Current status</Label>
            <div className="flex h-11 items-center">
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                post.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {post.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Featured image</Label>
            <FeaturedImageUploader
              name="featured_image_url"
              defaultValue={post.featured_image_url}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={2}
              defaultValue={post.excerpt ?? ""}
              placeholder="Short summary shown in listings and SEO descriptions…"
              maxLength={300}
            />
          </div>

          {/* Audience tags — only relevant for guides */}
          {post.post_type === "guide" && (
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Audience tags <span className="ml-1 text-xs font-normal text-muted-foreground">(guide only — shown as pill badges on the guide page)</span></Label>
              <AudienceTagPicker
                name="audience_tags"
                defaultValue={post.audience_tags ?? []}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6">
          <Label>Content</Label>
          <RichTextEditor
            name="content"
            defaultValue={post.content ?? ""}
            placeholder="Start writing your guide…"
            minHeight="min-h-[400px]"
            maxHeight="max-h-[70vh]"
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <a href={"/admin/blog" as Route} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to posts
          </a>
          <div className="flex gap-3">
            {post.status === "published" ? (
              <>
                <Button type="submit" variant="outline">Unpublish</Button>
                <Button type="submit" formAction={updateBlogPostAsPublishedAction}>Save changes</Button>
              </>
            ) : (
              <>
                <Button type="submit" variant="outline">Save draft</Button>
                <Button type="submit" formAction={updateBlogPostAsPublishedAction}>Publish</Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
