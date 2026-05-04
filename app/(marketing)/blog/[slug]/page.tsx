import type { Metadata } from "next";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ShareButtons } from "@/components/share-buttons";
import { getPublishedBlogPostBySlug } from "@/lib/blog-posts";
import { processBlogContent } from "@/lib/process-blog-content";

const BASE_URL = "https://kspa.online";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post || post.post_type !== "blog") return { title: "Not Found" };

  return {
    title: `${post.title} | KSpa Online`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: post.featured_image_url ? [{ url: post.featured_image_url }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post || post.post_type !== "blog") notFound();

  const pageUrl = `${BASE_URL}/blog/${slug}`;

  return (
    <div className="pb-20">
      <Container className="max-w-3xl py-12">
        <Link
          href={"/blog" as Route}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All posts
        </Link>

        {post.featured_image_url && (
          <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-96">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 768px, 100vw"
            />
          </div>
        )}

        <article className={post.featured_image_url ? "mt-10" : "mt-8"}>
          <header className="mb-8">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Blog</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
            )}
            {post.published_at && (
              <p className="mt-4 text-sm text-muted-foreground">
                Published{" "}
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
              <ShareButtons url={pageUrl} title={post.title} />
            </div>
          </header>

          {post.content ? (
            <div
              className="article-prose"
              dangerouslySetInnerHTML={{ __html: processBlogContent(post.content) }}
            />
          ) : (
            <p className="text-muted-foreground">Content coming soon.</p>
          )}
        </article>
      </Container>
    </div>
  );
}
