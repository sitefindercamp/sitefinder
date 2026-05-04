import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Container } from "@/components/layout/container";
import { LocationSpaCard } from "@/components/spas/location-spa-card";
import type { LocationSpa } from "@/lib/location-spas";
import type { USState } from "@/lib/us-locations";

type Props = {
  cityName: string;
  state: USState | null; // null if city straddles a state or is international
  spas: LocationSpa[];
};

export function CityLandingPage({ cityName, state, spas }: Props) {
  const title = state
    ? `Korean Spas in ${cityName}, ${state.abbr}`
    : `Korean Spas in ${cityName}`;

  const stateHref = state ? (`/spas/${state.slug}` as Route) : ("/spas" as Route);
  const stateLabel = state ? `Spas in ${state.name}` : "All spas";

  return (
    <Container className="py-16">
      <Link
        href={stateHref}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {stateLabel}
      </Link>

      <div className="mt-10">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Korean Spas
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          {spas.length > 0
            ? `${spas.length} Korean spa listing${spas.length === 1 ? "" : "s"} in ${cityName}. Find hours, amenities, pricing, and more.`
            : `We don't have any Korean spa listings in ${cityName} yet. Check back soon or browse all locations.`}
        </p>
      </div>

      <div className="mt-10">
        {spas.length === 0 ? (
          <div className="surface p-10 text-center">
            <p className="text-lg font-semibold">No listings yet</p>
            <p className="mt-2 text-muted-foreground">
              Korean spa listings in {cityName} will appear here once published.
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
