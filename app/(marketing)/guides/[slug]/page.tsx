import type { Metadata } from "next";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";

import { Container } from "@/components/layout/container";
import { GuideCta } from "@/components/guides/guide-cta";
import { GuideToc } from "@/components/guides/guide-toc";
import { ShareButtons } from "@/components/share-buttons";
import { getPublishedBlogPostBySlug } from "@/lib/blog-posts";
import { parseHeadings, injectHeadingIds, splitContentSegments } from "@/lib/guide-utils";
import { processBlogContent } from "@/lib/process-blog-content";
import { injectGlossaryTooltips } from "@/lib/glossary";
import { AUDIENCE_TAGS } from "@/lib/audience-tags";
import { getCtaSpas } from "@/lib/spa-cta";

const BASE_URL = "https://kspa.online";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };

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

/**
 * Split an excerpt string into bullet points.
 * Splits on newlines, "•", or sentences ending with ". "
 * Returns an array of non-empty strings.
 */
function excerptToPoints(excerpt: string): string[] {
  // If it already contains bullets or newlines, split there
  if (excerpt.includes("\n") || excerpt.includes("•")) {
    return excerpt
      .split(/\n|•/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // Otherwise split on ". " to make natural sentence bullets
  return excerpt
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function GuidePostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const pageUrl = `${BASE_URL}/guides/${slug}`;

  // Parse headings + inject IDs + inject glossary tooltips, then split segments
  const tocEntries = post.content ? parseHeadings(post.content) : [];
  const processedHtml = post.content
    ? injectGlossaryTooltips(injectHeadingIds(post.content, tocEntries))
    : null;
  const segments = processedHtml ? splitContentSegments(processedHtml) : [];

  // Fetch CTA spas once (reused across all CTA blocks in this guide)
  const hasCtas = segments.some((s) => s.type === "cta");
  const ctaSpas = hasCtas ? await getCtaSpas(3) : [];

  // Audience tag labels (only the ones actually set on this post)
  const audienceTags = (post.audience_tags ?? [])
    .map((v) => AUDIENCE_TAGS.find((t) => t.value === v))
    .filter(Boolean) as (typeof AUDIENCE_TAGS)[number][];

  const hasToc = tocEntries.length >= 2;

  // Build "What you'll learn" bullet points from excerpt (need ≥2 to show box)
  const learnPoints = post.excerpt ? excerptToPoints(post.excerpt).slice(0, 5) : [];

  return (
    <div className="pb-24">
      <Container className="max-w-6xl py-10">
        {/* Back link */}
        <Link
          href={"/guides" as Route}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All guides
        </Link>

        {/* Featured image */}
        {post.featured_image_url && (
          <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl sm:h-80 lg:h-[420px]">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1280px) 1152px, 100vw"
            />
          </div>
        )}

        {/* Two-column grid: article + sticky TOC */}
        <div
          className={
            hasToc
              ? "mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_220px]"
              : "mt-10"
          }
        >
          {/* ── Main article column ───────────────────────── */}
          <article>
            {/* Header */}
            <header className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                Guide
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                {post.title}
              </h1>

              {/* Audience tags */}
              {audienceTags.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Good for:
                  </span>
                  {audienceTags.map(({ value, label }) => (
                    <span
                      key={value}
                      className="inline-flex rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-foreground"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
                <ShareButtons url={pageUrl} title={post.title} />
              </div>
            </header>

            {/* "What you'll learn" box — only shown when there are 2+ points */}
            {learnPoints.length >= 2 && (
              <div className="guide-learn-box">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 shrink-0 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    What you&apos;ll learn
                  </p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {learnPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article body — prose segments interspersed with CTA cards */}
            {segments.length > 0 ? (
              segments.map((segment, i) =>
                segment.type === "prose" ? (
                  <div
                    key={i}
                    className="article-prose"
                    dangerouslySetInnerHTML={{ __html: processBlogContent(segment.html) }}
                  />
                ) : (
                  <GuideCta key={i} variant={segment.variant} spas={ctaSpas} />
                )
              )
            ) : (
              <p className="text-muted-foreground">Content coming soon.</p>
            )}
          </article>

          {/* ── Sticky TOC sidebar ────────────────────────── */}
          {hasToc && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border bg-secondary/20 p-5">
                <GuideToc entries={tocEntries} />
              </div>
            </aside>
          )}
        </div>
      </Container>
    </div>
  );
}
