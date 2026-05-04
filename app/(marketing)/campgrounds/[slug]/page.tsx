import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedCampgroundBySlug } from "@/lib/campgrounds";
import { CAMPGROUND_AMENITIES } from "@/types/campground";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campground = await getPublishedCampgroundBySlug(slug);

  if (!campground) {
    return { title: "Campground not found" };
  }

  return {
    title: campground.name,
    description:
      campground.description ??
      `Details for ${campground.name} in ${campground.city}, ${campground.state}.`,
  };
}

export default async function CampgroundDetailPage({ params }: Props) {
  const { slug } = await params;
  const campground = await getPublishedCampgroundBySlug(slug);

  if (!campground) notFound();

  const amenities = CAMPGROUND_AMENITIES.filter((amenity) => campground[amenity.key] === true);
  const location = [campground.address, campground.city, campground.state, campground.zip]
    .filter(Boolean)
    .join(", ");

  return (
    <Container className="py-10 sm:py-14">
      <article className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          {campground.campground_type ? (
            <Badge variant="secondary">{campground.campground_type}</Badge>
          ) : null}
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {campground.name}
          </h1>
          <p className="mt-4 flex items-center gap-2 text-base text-muted-foreground">
            <MapPin className="size-5" />
            {[campground.city, campground.state].filter(Boolean).join(", ")}
          </p>

          <div className="mt-8 prose prose-neutral max-w-none">
            <p className="text-lg leading-8 text-muted-foreground">
              {campground.description ?? "Campground details are being prepared."}
            </p>
          </div>

          <Card className="mt-8 rounded-lg">
            <CardHeader>
              <CardTitle>RV Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              {amenities.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <div
                      key={amenity.key}
                      className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm font-medium"
                    >
                      {amenity.label}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Amenity details have not been confirmed yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>Campground Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              {location ? (
                <div>
                  <p className="font-medium text-foreground">Address</p>
                  <p className="mt-1 leading-6 text-muted-foreground">{location}</p>
                </div>
              ) : null}
              {campground.price_range ? (
                <div>
                  <p className="font-medium text-foreground">Price range</p>
                  <p className="mt-1 text-muted-foreground">{campground.price_range}</p>
                </div>
              ) : null}
              <div className="grid gap-2 pt-2">
                {campground.website ? (
                  <Button asChild>
                    <a href={campground.website} target="_blank" rel="noreferrer">
                      Website
                      <ExternalLink data-icon="inline-end" />
                    </a>
                  </Button>
                ) : null}
                {campground.phone ? (
                  <Button asChild variant="outline">
                    <a href={`tel:${campground.phone}`}>
                      <Phone data-icon="inline-start" />
                      {campground.phone}
                    </a>
                  </Button>
                ) : null}
                {campground.email ? (
                  <Button asChild variant="outline">
                    <a href={`mailto:${campground.email}`}>
                      <Mail data-icon="inline-start" />
                      Email
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </aside>
      </article>
    </Container>
  );
}
