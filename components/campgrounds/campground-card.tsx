import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, Plug, Waves } from "lucide-react";

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
