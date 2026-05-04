import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Spa } from "@/types/spa";

type SpaCardProps = {
  spa: Spa;
  compact?: boolean;
};

export function SpaCard({ spa, compact = false }: SpaCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className={compact ? "pb-4" : ""}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <Badge variant="secondary">{spa.city}</Badge>
            <CardTitle className="mt-4 text-xl">{spa.name}</CardTitle>
          </div>
          <div className="rounded-full bg-secondary p-3">
            <MapPin className="size-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground">
          {compact ? spa.description.slice(0, 92) + "..." : spa.description}
        </p>
        <div className="flex flex-wrap gap-2">
          {spa.amenities.slice(0, compact ? 2 : 3).map((amenity) => (
            <Badge key={amenity} variant="outline">
              {amenity}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{spa.priceLabel}</p>
          <p className="text-xs text-muted-foreground">{spa.neighborhood}</p>
        </div>
        <Button asChild variant="ghost">
          <Link href={`/spas/${spa.slug}`}>
            View
            <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

