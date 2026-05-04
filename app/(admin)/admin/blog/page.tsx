import type { Route } from "next";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { DeletePostButton } from "@/components/admin/delete-post-button";
import { listAllBlogPosts, type BlogPost, type BlogPostType } from "@/lib/blog-posts";

export const metadata = { title: "Blog Posts | Admin" };

type Props = {
  searchParams?: Promise<{ deleted?: string }>;
};

function publicUrl(type: string, slug: string): string {
  if (type === "blog") return `/blog/${slug}`;
  if (type === "page") return `/p/${slug}`;
  return `/guides/${slug}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SECTIONS: { type: BlogPostType; label: string; emptyLabel: string }[] = [
  { type: "guide",  label: "Guides",     emptyLabel: "No guides yet." },
  { type: "blog",   label: "Blog posts", emptyLabel: "No blog posts yet." },
  { type: "page",   label: "Pages",      emptyLabel: "No pages yet." },
];

export default async function AdminBlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const deleted = params?.deleted === "1";
  const posts = await listAllBlogPosts();

  const byType = (type: BlogPostType) => posts.filter((p) => p.post_type === type);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <PageIntro
          eyebrow="Admin"
          title="Blog posts"
          description="Create and manage guides, tips, and editorial content."
        />
        <Button asChild className="shrink-0">
          <Link href={"/admin/blog/new" as Route}>
            <Plus data-icon="inline-start" />
            New post
          </Link>
        </Button>
      </div>

      {deleted && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Post deleted.
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No posts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first guide or blog post to get started.
          </p>
          <Button asChild className="mt-4">
            <Link href={"/admin/blog/new" as Route}>New post</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {SECTIONS.map(({ type, label, emptyLabel }) => {
            const section = byType(type);
            // Hide empty sections unless everything is empty
            if (section.length === 0) return null;

            return (
              <section key={type}>
                {/* Section header */}
                <div className="mb-3 flex items-center gap-3">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {label}
                  </h2>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                    {section.length}
                  </span>
                </div>

                {/* Post rows */}
                <div className="overflow-hidden rounded-2xl border border-border">
                  {section.map((post, i) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      isLast={i === section.length - 1}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PostRow({ post, isLast }: { post: BlogPost; isLast: boolean }) {
  const liveUrl = publicUrl(post.post_type, post.slug);

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      {/* Title + metadata */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={(`/admin/blog/${post.id}`) as Route}
            className="truncate font-medium text-foreground hover:text-primary hover:underline"
          >
            {post.title}
          </Link>
          <StatusBadge status={post.status} />
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          {post.status === "published" && post.published_at
            ? `Published ${formatDate(post.published_at)}`
            : "Draft"}
          {" · "}
          Updated {formatDate(post.updated_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-xs">
          <Link href={(`/admin/blog/${post.id}`) as Route}>Edit</Link>
        </Button>

        {post.status === "published" && (
          <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-xs text-emerald-700 hover:text-emerald-800">
            <Link href={liveUrl as Route} target="_blank">
              View live
              <ExternalLink className="ml-1 size-3" />
            </Link>
          </Button>
        )}

        <DeletePostButton id={post.id} title={post.title} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${
        status === "published"
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status === "published" ? "Live" : "Draft"}
    </span>
  );
}
