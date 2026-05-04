import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getPublishedBlogPostBySlug } from "@/lib/blog-posts";
import { processBlogContent } from "@/lib/process-blog-content";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post || post.post_type !== "page") return { title: "Not Found" };

  return {
    title: `${post.title} | KSpa Online`,
    description: post.excerpt ?? undefined,
  };
}

export default async function StandalonePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post || post.post_type !== "page") notFound();

  return (
    <div className="pb-20">
      <Container className="max-w-3xl py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
            )}
            <div className="mt-6 border-t border-border" />
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
