/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronLeft,
  Facebook,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Star,
  Twitter,
  XCircle,
  Youtube,
} from "lucide-react";

import {
  AMENITY_CATEGORIES,
  normalizeAmenitySelection,
} from "@/lib/amenities";
import { Container } from "@/components/layout/container";
import { ShareButtons } from "@/components/share-buttons";
import { FavoriteButton } from "@/components/spas/favorite-button";
import { StateLandingPage } from "@/components/spas/state-landing-page";
import { CityLandingPage } from "@/components/spas/city-landing-page";
import { SpaGalleryLightbox } from "@/components/spas/spa-gallery-lightbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listSpaImagesBySpaId } from "@/lib/spa-images";
import {
  getApprovedReviewSummary,
  getUserReviewForSpa,
  listApprovedReviewsBySpaId,
} from "@/lib/spa-reviews";
import { isSpaFavorited } from "@/lib/spa-favorites";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  resolveStateFromSlug,
  getSpasByState,
  getSpasByCity,
  getCitiesInState,
} from "@/lib/location-spas";
import { US_STATE_BY_SLUG, slugToCity, stateToSlug } from "@/lib/us-locations";

const BASE_URL = "https://kspa.online";

type SpaDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ review_submitted?: string }>;
};

type PublicSpa = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  business_website: string | null;
  business_phone: string | null;
  business_email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  summary: string | null;
  description: string | null;
  hours_text: string | null;
  pricing_text: string | null;
  day_pass_offered: boolean;
  day_pass_price: string | null;
  listing_categories: string[];
  amenities: string[];
  what_to_know: string | null;
  important_notes: string | null;
  google_review_url: string | null;
  yelp_review_url: string | null;
};

async function getPublishedSpaBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("spas")
    .select("id, slug, name, city, state")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load spa: ${error.message}`);
  }

  const spa = data as Partial<PublicSpa> | null;

  if (!spa) {
    return null;
  }

  const optionalFields = [
    "summary",
    "description",
    "address_line_1",
    "address_line_2",
    "postal_code",
    "country",
    "website",
    "phone",
    "email",
    "business_website",
    "business_phone",
    "business_email",
    "facebook_url",
    "instagram_url",
    "tiktok_url",
    "twitter_url",
    "youtube_url",
    "hours_text",
    "pricing_text",
    "day_pass_offered",
    "day_pass_price",
    "listing_categories",
    "amenities",
    "what_to_know",
    "important_notes",
    "google_review_url",
    "yelp_review_url",
  ] as const;

  const optionalFieldResults = await Promise.all(
    optionalFields.map(async (field) => {
      const result = await supabase
        .from("spas")
        .select(field)
        .eq("status", "published")
        .eq("slug", slug)
        .maybeSingle();

      if (result.error) {
        if (result.error.message.includes(field)) {
          return [field, null] as const;
        }

        throw new Error(`Failed to load spa: ${result.error.message}`);
      }

      const row = (result.data ?? null) as Record<string, unknown> | null;

      return [field, row?.[field] ?? null] as const;
    })
  );

  const optionalData = optionalFieldResults.reduce<
    Partial<Record<(typeof optionalFields)[number], unknown | null>>
  >((accumulator, [field, value]) => {
    accumulator[field] = value;
    return accumulator;
  }, {});

  const asNullableString = (value: unknown): string | null =>
    typeof value === "string" ? value : null;

  const asStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.map((item) => String(item)) : [];

  const asBoolean = (value: unknown): boolean =>
    typeof value === "boolean" ? value : Boolean(value);

  return {
    id: String(spa.id ?? ""),
    slug: spa.slug ?? slug,
    name: spa.name ?? "Untitled spa",
    city: spa.city ?? null,
    state: spa.state ?? null,
    summary: asNullableString(optionalData.summary),
    description: asNullableString(optionalData.description),
    address_line_1: asNullableString(optionalData.address_line_1),
    address_line_2: asNullableString(optionalData.address_line_2),
    postal_code: asNullableString(optionalData.postal_code),
    country: asNullableString(optionalData.country),
    website: asNullableString(optionalData.website),
    phone: asNullableString(optionalData.phone),
    email: asNullableString(optionalData.email),
    business_website: asNullableString(optionalData.business_website),
    business_phone: asNullableString(optionalData.business_phone),
    business_email: asNullableString(optionalData.business_email),
    facebook_url: asNullableString(optionalData.facebook_url),
    instagram_url: asNullableString(optionalData.instagram_url),
    tiktok_url: asNullableString(optionalData.tiktok_url),
    twitter_url: asNullableString(optionalData.twitter_url),
    youtube_url: asNullableString(optionalData.youtube_url),
    hours_text: asNullableString(optionalData.hours_text),
    pricing_text: asNullableString(optionalData.pricing_text),
    day_pass_offered: asBoolean(optionalData.day_pass_offered),
    day_pass_price: asNullableString(optionalData.day_pass_price),
    listing_categories: asStringArray(optionalData.listing_categories),
    amenities: asStringArray(optionalData.amenities),
    what_to_know: asNullableString(optionalData.what_to_know),
    important_notes: asNullableString(optionalData.important_notes),
    google_review_url: asNullableString(optionalData.google_review_url),
    yelp_review_url: asNullableString(optionalData.yelp_review_url),
  } satisfies PublicSpa;
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ");
}

// ── Related spas ─────────────────────────────────────────────────────────────

type RelatedSpa = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string | null;
  listing_categories: string[];
};

async function getRelatedSpas(
  currentId: string,
  city: string | null,
  state: string | null,
): Promise<RelatedSpa[]> {
  const supabase = await createSupabaseServerClient();
  const select = "id, slug, name, city, state, listing_categories";
  const results: RelatedSpa[] = [];

  // Try same city first
  if (city) {
    const { data } = await supabase
      .from("spas")
      .select(select)
      .eq("status", "published")
      .ilike("city", city)
      .neq("id", currentId)
      .limit(3);
    results.push(...((data ?? []) as unknown as RelatedSpa[]));
  }

  // Fill remaining slots from same state
  if (results.length < 3 && state) {
    const existingIds = new Set(results.map((s) => s.id));
    const { data } = await supabase
      .from("spas")
      .select(select)
      .eq("status", "published")
      .ilike("state", state)
      .neq("id", currentId)
      .limit(6); // fetch extra so we can filter out city dupes
    for (const row of (data ?? []) as unknown as RelatedSpa[]) {
      if (!existingIds.has(row.id) && results.length < 3) results.push(row);
    }
  }

  return results;
}

// ── JSON-LD structured data ───────────────────────────────────────────────────

function buildBreadcrumbJsonLd(spa: PublicSpa, pageUrl: string) {
  const items: Array<{ "@type": string; position: number; name: string; item: string }> = [
    { "@type": "ListItem", position: 1, name: "Spas", item: `${BASE_URL}/spas` },
  ];
  if (spa.state) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: spa.state,
      item: `${BASE_URL}/spas/${stateToSlug(spa.state) ?? spa.state.toLowerCase().replace(/\s+/g, "-")}`,
    });
  }
  items.push({ "@type": "ListItem", position: items.length + 1, name: spa.name, item: pageUrl });

  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items };
}

function buildSpaJsonLd({
  spa,
  pageUrl,
  phone,
  email,
  website,
  featuredImageUrl,
  reviewSummary,
  approvedReviews,
  mapCoords,
}: {
  spa: PublicSpa;
  pageUrl: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  featuredImageUrl: string | null;
  reviewSummary: { average: number; count: number };
  approvedReviews: Array<{ rating: number; title: string | null; body: string; created_at: string | null; user_display_name: string }>;
  mapCoords: { lat: number; lon: number } | null;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ld: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: spa.name,
    url: pageUrl,
  };

  if (spa.summary || spa.description) {
    ld.description = spa.summary ?? spa.description;
  }
  if (phone) ld.telephone = phone;
  if (email) ld.email = email;
  if (website) ld.sameAs = website;
  if (featuredImageUrl) ld.image = featuredImageUrl;

  // Address
  if (spa.address_line_1 || spa.city || spa.state) {
    ld.address = {
      "@type": "PostalAddress",
      ...(spa.address_line_1 && { streetAddress: spa.address_line_1 }),
      ...(spa.city && { addressLocality: spa.city }),
      ...(spa.state && { addressRegion: spa.state }),
      ...(spa.postal_code && { postalCode: spa.postal_code }),
      addressCountry: spa.country || "US",
    };
  }

  // Geo coordinates
  if (mapCoords) {
    ld.geo = {
      "@type": "GeoCoordinates",
      latitude: mapCoords.lat,
      longitude: mapCoords.lon,
    };
  }

  // Aggregate rating
  if (reviewSummary.count > 0) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.average.toFixed(1),
      reviewCount: reviewSummary.count,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Individual reviews (up to 5 — keeps payload small, Google only needs a sample)
  if (approvedReviews.length > 0) {
    ld.review = approvedReviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.user_display_name || "Verified Guest" },
      reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
      ...(r.title && { name: r.title }),
      reviewBody: r.body,
      ...(r.created_at && { datePublished: r.created_at.slice(0, 10) }),
    }));
  }

  return ld;
}

// ── Geocoding (Nominatim / OpenStreetMap — free, no API key) ─────────────────

async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: { "User-Agent": "KSpaOnline/1.0 (hello@kspa.online)" },
        next: { revalidate: 60 * 60 * 24 }, // cache 24 h
      }
    );
    const results = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

// ── Map card ─────────────────────────────────────────────────────────────────

function SpaMapCard({
  coords,
  address,
}: {
  coords: { lat: number; lon: number };
  address: string;
}) {
  const delta = 0.008;
  const bbox = [
    coords.lon - delta,
    coords.lat - delta,
    coords.lon + delta,
    coords.lat + delta,
  ].join(",");
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lon}`;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;

  return (
    <Card className="rounded-[24px] shadow-none">
      <CardContent className="p-4">
        <div className="overflow-hidden rounded-2xl border border-border">
          <iframe
            title="Spa location map"
            src={osmEmbed}
            className="aspect-[4/3] w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={appleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            <Navigation className="size-3.5 text-primary" />
            Apple Maps
          </a>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary"
          >
            <Navigation className="size-3.5 text-primary" />
            Google Maps
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function RichSection({
  title,
  body,
}: {
  title: string;
  body?: string | null;
}) {
  if (!body) return null;
  const isHtml = body.trimStart().startsWith("<");
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-foreground">{title}</h2>
      {isHtml ? (
        <div
          className="article-prose text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
          {body}
        </p>
      )}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={
            star <= Math.round(rating)
              ? "size-4 fill-amber-400 text-amber-400"
              : "size-4 fill-muted-foreground/20 text-muted-foreground/20"
          }
        />
      ))}
    </div>
  );
}

export async function generateMetadata({ params }: SpaDetailPageProps) {
  const { slug } = await params;

  // State landing page
  const stateMatch = resolveStateFromSlug(slug);
  if (stateMatch) {
    return {
      title: `Korean Spas in ${stateMatch.name} | KSpa Online`,
      description: `Browse Korean spa listings in ${stateMatch.name}. Find hours, amenities, day passes, and more.`,
    };
  }

  // Spa detail
  const spa = await getPublishedSpaBySlug(slug);
  if (spa) {
    const description =
      spa.summary ||
      (spa.description
        ? spa.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 200)
        : null) ||
      `${spa.name} — Korean spa listing on KSpa Online.`;

    // Grab the first gallery image for the OG card
    const images = await listSpaImagesBySpaId(spa.id);
    const ogImage =
      images.find((img) => img.kind === "gallery")?.public_url ?? null;

    return {
      title: spa.name,
      description,
      openGraph: {
        title: spa.name,
        description,
        type: "website",
        url: `${BASE_URL}/spas/${spa.slug}`,
        ...(ogImage && {
          images: [{ url: ogImage, alt: spa.name }],
        }),
      },
      twitter: {
        card: ogImage ? "summary_large_image" : "summary",
        title: spa.name,
        description,
        ...(ogImage && { images: [ogImage] }),
      },
    };
  }

  // City landing page
  const cityName = slugToCity(slug);
  return {
    title: `Korean Spas in ${cityName} | KSpa Online`,
    description: `Browse Korean spa listings in ${cityName}. Find hours, amenities, day passes, and more.`,
  };
}

export default async function SpaDetailPage({
  params,
  searchParams,
}: SpaDetailPageProps) {
  noStore();

  const { slug } = await params;
  const query = await searchParams;

  // ── 1. State landing page ─────────────────────────────────────────────────
  const stateMatch = resolveStateFromSlug(slug);
  if (stateMatch) {
    const stateInfo = US_STATE_BY_SLUG.get(slug)!;
    const [spas, cities] = await Promise.all([
      getSpasByState(stateMatch.name, stateMatch.abbr),
      getCitiesInState(stateMatch.name, stateMatch.abbr),
    ]);
    return <StateLandingPage state={stateInfo} spas={spas} cities={cities} />;
  }

  // ── 2. Individual spa ─────────────────────────────────────────────────────
  const spa = await getPublishedSpaBySlug(slug);
  if (!spa) {
    // ── 3. City landing page ───────────────────────────────────────────────
    const cityName = slugToCity(slug);
    const citySpas = await getSpasByCity(cityName);
    if (citySpas.length === 0) notFound();

    const firstState = citySpas[0]?.state ?? null;
    const inferredState = firstState ? (US_STATE_BY_SLUG.get(stateToSlug(firstState) ?? "") ?? null) : null;

    return (
      <CityLandingPage
        cityName={cityName}
        state={inferredState}
        spas={citySpas}
      />
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const location = joinParts([spa.city, spa.state]);
  // Include country in the geocodable address so non-US spas resolve correctly
  const isUS = !spa.country || spa.country.toLowerCase().includes("united states") || spa.country.toUpperCase() === "US";
  const fullAddress = joinParts([
    spa.address_line_1,
    spa.address_line_2,
    location,
    spa.postal_code,
    isUS ? null : spa.country,
  ]);
  const browseHref: Route = "/spas";
  const pageUrl = `${BASE_URL}/spas/${spa.slug}`;
  const website = spa.business_website || spa.website;
  const phone = spa.business_phone || spa.phone;
  const email = spa.business_email || spa.email;

  const pricing =
    spa.pricing_text ||
    (spa.day_pass_offered
      ? spa.day_pass_price
        ? `Day pass available · ${spa.day_pass_price}`
        : "Day pass available"
      : null);
  const pricingLabel = spa.day_pass_offered ? "Day pass" : "Pricing";

  const socialLinks = [
    { label: "Facebook", href: spa.facebook_url },
    { label: "Instagram", href: spa.instagram_url },
    { label: "TikTok", href: spa.tiktok_url },
    { label: "Twitter / X", href: spa.twitter_url },
    { label: "YouTube", href: spa.youtube_url },
  ].filter((item): item is { label: string; href: string } => Boolean(item.href));

  const enabledAmenities = new Set(normalizeAmenitySelection(spa.amenities));
  const primaryCategory = spa.listing_categories[0] ?? null;
  const allCategories = spa.listing_categories;

  const images = spa.id ? await listSpaImagesBySpaId(spa.id) : [];
  const logoImage = images.find((image) => image.kind === "logo") ?? null;
  const galleryImages = images.filter((image) => image.kind === "gallery");
  const featuredImage = galleryImages[0] ?? null;
  const galleryGridImages = galleryImages.slice(1, 5);
  const lightboxImages = galleryGridImages.map((image, index) => ({
    id: image.id,
    public_url: image.public_url,
    alt: `${spa.name} gallery photo ${index + 2}`,
  }));

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [reviewSummary, reviews, userReview, mapCoords, favorited, relatedSpas] = await Promise.all([
    getApprovedReviewSummary(spa.id),
    listApprovedReviewsBySpaId(spa.id),
    user ? getUserReviewForSpa(spa.id, user.id) : Promise.resolve(null),
    fullAddress ? geocodeAddress(fullAddress) : Promise.resolve(null),
    user ? isSpaFavorited(user.id, spa.id) : Promise.resolve(false),
    getRelatedSpas(spa.id, spa.city, spa.state),
  ]);

  const hasExternalLinks = spa.google_review_url || spa.yelp_review_url || socialLinks.length > 0;
  const hasHoursOrPricing = spa.hours_text || pricing;
  const hasNotes = spa.what_to_know || spa.important_notes;

  const jsonLd = buildSpaJsonLd({
    spa,
    pageUrl,
    phone,
    email,
    website,
    featuredImageUrl: featuredImage?.public_url ?? null,
    reviewSummary,
    approvedReviews: reviews,
    mapCoords,
  });
  const breadcrumbLd = buildBreadcrumbJsonLd(spa, pageUrl);

  return (
    <Container className="py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <Link
        href={browseHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Browse spas
      </Link>

      {/* Featured image */}
      {featuredImage ? (
        <div className="mt-4 overflow-hidden rounded-3xl">
          <img
            src={featuredImage.public_url}
            alt={`${spa.name} featured photo`}
            className="h-[260px] w-full object-cover md:h-[380px]"
          />
        </div>
      ) : null}

      {/* Review submitted banner */}
      {query?.review_submitted ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Your review has been submitted and is pending approval.
        </div>
      ) : null}

      {/* ── Two-column layout starts right after the image ───────────────────── */}
      <div className="mt-6 grid gap-8 xl:items-start xl:grid-cols-[1fr_300px]">

        {/* Left — hero header + main content */}
        <div className="flex flex-col gap-6">

          {/* Hero: name, categories, rating, summary, actions */}
          <div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{spa.name}</h1>

            {allCategories.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {allCategories.map((cat, i) => (
                  <Badge
                    key={cat}
                    variant={i === 0 ? "default" : "outline"}
                    className={i === 0 ? "bg-primary text-primary-foreground hover:bg-primary" : undefined}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {reviewSummary.count > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <StarRating rating={reviewSummary.average} />
                  {reviewSummary.average.toFixed(1)}
                  <span className="text-muted-foreground/60">
                    ({reviewSummary.count} review{reviewSummary.count === 1 ? "" : "s"})
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground/60">No reviews yet</span>
              )}
              {(fullAddress || location) && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" />
                  {fullAddress || location}
                </span>
              )}
            </div>

            {spa.summary && (
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {spa.summary}
              </p>
            )}

            {/* Action buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {userReview?.status === "pending" ? (
                <p className="inline-block rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                  Your review is awaiting approval.
                </p>
              ) : userReview ? (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/spas/${spa.slug}/review` as Route}>Edit your review</Link>
                </Button>
              ) : user ? (
                <Button asChild size="sm">
                  <Link href={`/spas/${spa.slug}/review` as Route}>
                    <MessageSquare className="size-4" />
                    Write a review
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link href={"/signin?message=Please+sign+in+to+review" as Route}>
                    Sign in to review
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <Link href={`/claim/${spa.slug}` as Route}>Claim this listing</Link>
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <ShareButtons
                  url={pageUrl}
                  title={spa.name}
                  text={`Check out ${spa.name}${spa.city ? ` in ${spa.city}` : ""} on KSpa.online`}
                />
                <FavoriteButton
                  spaId={spa.id}
                  spaSlug={spa.slug}
                  initialIsFavorited={favorited}
                  isLoggedIn={!!user}
                />
              </div>
            </div>
          </div>

          {/* About */}
          {spa.description && (
            <Card className="rounded-[24px] shadow-none">
              <CardContent className="p-6">
                <RichSection title="About this spa" body={spa.description} />
              </CardContent>
            </Card>
          )}

          {/* Hours + Pricing — one card, two sections */}
          {hasHoursOrPricing && (
            <Card className="rounded-[24px] shadow-none">
              <CardContent className="divide-y divide-border p-6">
                {spa.hours_text && (
                  <div className={spa.pricing_text || pricing ? "pb-5" : ""}>
                    <RichSection title="Hours" body={spa.hours_text} />
                  </div>
                )}
                {(spa.pricing_text || pricing) && (
                  <div className={spa.hours_text ? "pt-5" : ""}>
                    {spa.pricing_text && spa.pricing_text.trimStart().startsWith("<") ? (
                      <RichSection title={pricingLabel} body={spa.pricing_text} />
                    ) : (
                      <div>
                        <h2 className="mb-2 text-sm font-semibold text-foreground">{pricingLabel}</h2>
                        <p className="text-sm text-muted-foreground">{pricing}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* What to know + Important notes — one card, two sections */}
          {hasNotes && (
            <Card className="rounded-[24px] shadow-none">
              <CardContent className="divide-y divide-border p-6">
                {spa.what_to_know && (
                  <div className={spa.important_notes ? "pb-5" : ""}>
                    <RichSection title="What to know" body={spa.what_to_know} />
                  </div>
                )}
                {spa.important_notes && (
                  <div className={spa.what_to_know ? "pt-5" : ""}>
                    <RichSection title="Important notes" body={spa.important_notes} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Find us online — icon row */}
          {hasExternalLinks && (
            <Card className="rounded-[24px] shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Find us online</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {spa.google_review_url && (
                  <a
                    href={spa.google_review_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Google reviews"
                    className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {/* Google "G" icon */}
                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </a>
                )}
                {spa.yelp_review_url && (
                  <a
                    href={spa.yelp_review_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Yelp reviews"
                    className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    {/* Yelp burst icon */}
                    <svg className="size-5" viewBox="0 0 24 24" fill="#FF1A1A">
                      <path d="M12 2l1.5 4.5L18 4l-2.5 4 4.5 1.5-4 2 3 3.5-4.5-.5 1 4.5-3.5-3-3.5 3 1-4.5-4.5.5 3-3.5-4-2L9.5 8 7 4l4.5 2.5z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.map((item) => {
                  const icon =
                    item.label === "Facebook" ? <Facebook className="size-5" /> :
                    item.label === "Instagram" ? <Instagram className="size-5" /> :
                    item.label === "Twitter / X" ? <Twitter className="size-5" /> :
                    item.label === "YouTube" ? <Youtube className="size-5" /> :
                    item.label === "TikTok" ? (
                      <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                      </svg>
                    ) : <Globe className="size-5" />;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      title={item.label}
                      className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                    >
                      {icon}
                    </a>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Guest reviews */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Guest reviews</h2>
            <div className="flex flex-col gap-3">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[24px] border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <StarRating rating={review.rating} />
                        <p className="mt-1 text-sm font-medium">{review.user_display_name}</p>
                      </div>
                      {review.created_at ? (
                        <p className="text-xs text-muted-foreground">
                          {new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(review.created_at))}
                        </p>
                      ) : null}
                    </div>
                    {review.title ? (
                      <h3 className="mt-3 text-base font-semibold">{review.title}</h3>
                    ) : null}
                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                      {review.body}
                    </p>
                    {review.photos.length > 0 ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {review.photos.map((photo) => (
                          <a
                            key={photo.id}
                            href={photo.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-2xl border border-border"
                          >
                            <img
                              src={photo.image_url}
                              alt={`${spa.name} review photo`}
                              className="h-36 w-full object-cover transition hover:scale-105"
                            />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No approved reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="flex flex-col gap-4">

          {/* Logo */}
          {logoImage && (
            <div className="flex items-center justify-center rounded-[24px] border border-border bg-card px-6 py-5">
              <img
                src={logoImage.public_url}
                alt={`${spa.name} logo`}
                className="max-h-[100px] w-full object-contain object-center"
              />
            </div>
          )}

          {/* Contact card */}
          {(website || phone || email || fullAddress) && (
            <Card className="rounded-[24px] shadow-none">
              <CardContent className="flex flex-col gap-3 p-5 text-sm">
                {fullAddress && (
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{fullAddress}</span>
                  </a>
                )}
                {website && (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Globe className="size-4 shrink-0 text-primary" />
                    <span className="truncate">{website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Phone className="size-4 shrink-0 text-primary" />
                    {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="size-4 shrink-0 text-primary" />
                    {email}
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Amenities — all items with check/X indicators */}
          <Card className="rounded-[24px] shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Amenities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 pt-0">
              {AMENITY_CATEGORIES.map((category) => (
                <div key={category.title}>
                  <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
                    {category.title}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {category.items.map((amenity) => {
                      const enabled = enabledAmenities.has(amenity.label);
                      return (
                        <div
                          key={amenity.label}
                          className="inline-flex items-center gap-2 text-sm"
                        >
                          {enabled ? (
                            <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                          ) : (
                            <XCircle className="size-4 shrink-0 text-foreground/25" />
                          )}
                          <span className={`${enabled ? "text-foreground" : "text-muted-foreground/50"} ${amenity.italic ? "italic" : ""}`}>
                            {amenity.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Gallery */}
          <SpaGalleryLightbox images={lightboxImages} />

          {/* Map */}
          {mapCoords && fullAddress ? (
            <SpaMapCard coords={mapCoords} address={fullAddress} />
          ) : null}

        </aside>
      </div>

      {/* ── Related spas ─────────────────────────────────────────────────── */}
      {relatedSpas.length > 0 && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-xl font-semibold">
            {relatedSpas.some((s) => s.city.toLowerCase() === (spa.city ?? "").toLowerCase())
              ? `More Korean spas in ${spa.city}`
              : `More Korean spas in ${spa.state}`}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedSpas.map((related) => (
              <Link
                key={related.id}
                href={`/spas/${related.slug}` as Route}
                className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/30"
              >
                {related.listing_categories[0] && (
                  <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {related.listing_categories[0]}
                  </span>
                )}
                <p className="font-semibold leading-snug group-hover:text-primary">
                  {related.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {[related.city, related.state].filter(Boolean).join(", ")}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

    </Container>
  );
}
