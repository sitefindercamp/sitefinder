import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { LocationSpaCard } from "@/components/spas/location-spa-card";
import { Badge } from "@/components/ui/badge";
import type { LocationSpa, CityEntry } from "@/lib/location-spas";
import type { USState } from "@/lib/us-locations";

type Props = {
  state: USState;
  spas: LocationSpa[];
  cities: CityEntry[];
};

export function StateLandingPage({ state, spas, cities }: Props) {
  return (
    <Container className="py-16">
      <Link
        href={"/spas" as Route}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All spas
      </Link>

      <div className="mt-10">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Korean Spas
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          Korean Spas in {state.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {spas.length > 0
            ? `Discover ${spas.length} Korean spa listing${spas.length === 1 ? "" : "s"} across ${state.name}. Browse by city or explore all locations below.`
            : `We don't have any Korean spa listings in ${state.name} yet. Check back soon or browse all locations.`}
        </p>
      </div>

      {/* Cities in this state */}
      {cities.length > 1 && (
        <div className="mt-10">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Browse by city
          </h2>
          <div className="flex flex-wrap gap-3">
            {cities.map(({ city, citySlug, count }) => (
              <Link key={citySlug} href={`/spas/${citySlug}` as Route}>
                <Badge
                  variant="outline"
                  className="rounded-full px-4 py-2 text-sm hover:border-primary hover:text-primary cursor-pointer"
                >
                  <MapPin className="mr-1.5 size-3" />
                  {city}
                  <span className="ml-1.5 text-muted-foreground">({count})</span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spa listings */}
      <div className="mt-10">
        {spas.length > 0 && (
          <h2 className="mb-6 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            All listings in {state.name}
          </h2>
        )}
        {spas.length === 0 ? (
          <div className="surface p-10 text-center">
            <p className="text-lg font-semibold">No listings yet</p>
            <p className="mt-2 text-muted-foreground">
              Korean spa listings in {state.name} will appear here once published.
            </p>
            <Link
              href={"/spas" as Route}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Browse all spas
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {spas.map((spa) => (
              <LocationSpaCard key={spa.id} spa={spa} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
