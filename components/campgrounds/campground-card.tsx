import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, MapPin, Phone, Plug, Waves } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAMPGROUND_AMENITIES, type Campground } from "@/types/campground";

function getAmenityLabels(campground: Campground) {
  return CAMPGROUND_AMENITIES
    .filter((amenity) => campground[amenity.key] === true)
    .slice(0, 4)
    .map((amenity) => amenity.label);
}

export function CampgroundCard({ campground }: { campground: Campground }) {
  const amenityLabels = getAmenityLabels(campground);
  const location = [campground.city, campground.state].filter(Boolean).join(", ");

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {campground.campground_type ? (
              <Badge variant="secondary">{campground.campground_type}</Badge>
            ) : null}
            <CardTitle className="mt-3 text-xl leading-tight">
              <Link href={`/campgrounds/${campground.slug}` as Route} className="hover:underline">
                {campground.name}
              </Link>
            </CardTitle>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {location}
            </p>
          </div>
          <div className="rounded-full bg-secondary p-3">
            {campground.full_hookups ? (
              <Plug className="size-4 text-primary" />
            ) : (
              <Waves className="size-4 text-primary" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-4 text-sm leading-6 text-muted-foreground">
          {campground.description ?? "Campground details are being prepared."}
        </p>
        {amenityLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {amenityLabels.map((label) => (
              <Badge key={label} variant="outline">
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm font-medium text-foreground">
            {campground.price_range ?? "Pricing varies"}
          </p>
          <Link
            href={`/campgrounds/${campground.slug}` as Route}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Details
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompactCampgroundCard({ campground }: { campground: Campground }) {
  const amenityLabels = getAmenityLabels(campground);
  const location = [campground.city, campground.state].filter(Boolean).join(", ");
  const hasContact = Boolean(campground.phone || campground.website);
  const summaryAmenityLabels = amenityLabels.filter((label) => label !== "Full hookups").slice(0, 4);

  return (
    <article className="rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/35">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-[1.7rem]">
            <Link href={`/campgrounds/${campground.slug}` as Route} className="hover:text-primary">
              {campground.name}
            </Link>
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-base text-muted-foreground">
            {location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {location}
              </span>
            ) : null}
            <span>{campground.price_range ?? "Pricing varies"}</span>
          </div>

          <p className="mt-3 line-clamp-2 text-base leading-7 text-muted-foreground">
            {campground.description ?? "Campground details are being prepared."}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {campground.campground_type ? (
              <Badge variant="secondary" className="rounded-md px-2.5 py-1 text-sm">
                {campground.campground_type}
              </Badge>
            ) : null}
            {campground.full_hookups ? (
              <Badge variant="outline" className="rounded-md px-2.5 py-1 text-sm text-primary">
                Full hookups
              </Badge>
            ) : null}
            {summaryAmenityLabels.length > 0
              ? summaryAmenityLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-secondary-foreground"
                  >
                    {label}
                  </span>
                ))
              : null}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:justify-between">
          <Link
            href={`/campgrounds/${campground.slug}` as Route}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Details
          </Link>
          {hasContact ? (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {campground.phone ? (
                <a
                  href={`tel:${campground.phone}`}
                  aria-label={`Call ${campground.name}`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-secondary hover:text-foreground"
                >
                  <Phone className="size-4" />
                </a>
              ) : null}
              {campground.website ? (
                <a
                  href={campground.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Visit ${campground.name} website`}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border hover:bg-secondary hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
