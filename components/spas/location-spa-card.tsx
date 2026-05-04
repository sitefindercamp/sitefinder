/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LocationSpa } from "@/lib/location-spas";

export function LocationSpaCard({ spa }: { spa: LocationSpa }) {
  return (
    <Card className="h-full overflow-hidden">
      {spa.featured_image_url ? (
        <Link href={`/spas/${spa.slug}` as Route} aria-label={spa.name}>
          <img
            src={spa.featured_image_url}
            alt={`${spa.name} featured photo`}
            className="h-48 w-full object-cover transition duration-300 hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <Link
          href={`/spas/${spa.slug}` as Route}
          aria-label={spa.name}
          className="flex h-48 w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(14,108,93,0.18),transparent_34%),linear-gradient(135deg,#f4eee5,#fffaf3_48%,#edf4ef)]"
        >
          <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Kspa.online
          </div>
        </Link>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            {spa.listing_categories[0] ? (
              <Badge variant="secondary" className="rounded-full">
                {spa.listing_categories[0]}
              </Badge>
            ) : null}
            <CardTitle className="mt-2 text-xl">
              <Link href={`/spas/${spa.slug}` as Route} className="hover:underline">
                {spa.name}
              </Link>
            </CardTitle>
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-primary text-primary" />
              {spa.review_count} {spa.review_count === 1 ? "review" : "reviews"}
            </p>
          </div>
          <div className="rounded-full bg-secondary p-3">
            <MapPin className="size-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm font-medium text-foreground">
          {[spa.city, spa.state].filter(Boolean).join(", ")}
        </p>
        <p className="text-sm leading-6 text-muted-foreground">
          {spa.summary || "No summary available yet."}
        </p>
        <div className="pt-2">
          <Link
            href={`/spas/${spa.slug}` as Route}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View details
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
