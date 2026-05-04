import type { Metadata } from "next";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { listPublishedBlogPostsByType } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog | KSpa Online",
  description: "News, roundups, and editorial content about Korean spas.",
};

export default async function BlogPage() {
  const posts = await listPublishedBlogPostsByType("blog");

  return (
    <div className="pb-20">
      <Container className="py-12">
        <PageIntro
          eyebrow="Blog"
          title="Korean Spa Blog"
          description="News, roundups, and editorial content about Korean spa culture and destinations."
        />

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground/30" />
            <p className="mt-4 text-sm font-medium text-foreground">Posts coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check back soon for news and editorial content.
            </p>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={(`/blog/${post.slug}`) as Route}
                className="group surface flex flex-col overflow-hidden shadow-[0_12px_36px_-28px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
              >
                {/* Thumbnail */}
                {post.featured_image_url ? (
                  <div className="relative h-48 w-full shrink-0 overflow-hidden">
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                ) : (
                  <div className="flex h-36 w-full shrink-0 items-center justify-center bg-primary/5">
                    <BookOpen className="size-8 text-primary/20" />
                  </div>
                )}

                {/* Body */}
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">Blog</p>
                  <h2 className="text-xl font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="flex-1 text-sm leading-6 text-muted-foreground line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : null}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
