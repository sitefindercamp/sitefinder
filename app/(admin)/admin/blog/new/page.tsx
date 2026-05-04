import type { Route } from "next";

import {
  createBlogPostAsDraftAction,
  createBlogPostAsPublishedAction,
} from "@/app/(admin)/admin/blog/actions";
import { AudienceTagPicker } from "@/components/admin/audience-tag-picker";
import { FeaturedImageUploader } from "@/components/admin/featured-image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "New Post | Admin" };

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewBlogPostPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;

  return (
    <div className="flex flex-col gap-8">
      <PageIntro eyebrow="Admin · Blog" title="New post" description="Write a guide, tip, or editorial piece." />

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={createBlogPostAsDraftAction} className="flex flex-col gap-6">
        <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" placeholder="e.g. First Time at a Korean Spa" required autoFocus />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" placeholder="auto-generated from title if blank" />
            <p className="text-xs text-muted-foreground">URL: /guides/your-slug-here</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="post_type">Type</Label>
            <select
              id="post_type"
              name="post_type"
              defaultValue="guide"
              className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="guide">Guide</option>
              <option value="blog">Blog post</option>
              <option value="page">Page</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Featured image</Label>
            <FeaturedImageUploader name="featured_image_url" />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" name="excerpt" rows={2} placeholder="Short summary shown in listings and SEO descriptions…" maxLength={300} />
          </div>

          {/* Audience tags — relevant for guide posts */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label>Audience tags <span className="ml-1 text-xs font-normal text-muted-foreground">(guide only — shown as pill badges on the guide page)</span></Label>
            <AudienceTagPicker name="audience_tags" />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-6">
          <Label>Content</Label>
          <RichTextEditor name="content" placeholder="Start writing your guide…" minHeight="min-h-[400px]" maxHeight="max-h-[70vh]" />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <a href={"/admin/blog" as Route} className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to posts
          </a>
          <div className="flex gap-3">
            <Button type="submit" variant="outline">Save draft</Button>
            <Button type="submit" formAction={createBlogPostAsPublishedAction}>Publish</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
