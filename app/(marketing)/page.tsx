import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Map,
  MapPin,
  Plug,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  TentTree,
  TreePine,
  Waves,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listCampgroundFilterOptions } from "@/lib/campgrounds";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCampgroundCount() {
  try {
    const supabase = await createSupabaseServerClient();
    const { count, error } = await supabase
      .from("campgrounds")
      .select("id", { count: "exact", head: true });

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function getHomepageFilterOptions() {
  try {
    return await listCampgroundFilterOptions();
  } catch {
    return { states: [], cities: [], campgroundTypes: [] };
  }
}

export default async function HomePage() {
  const [campgroundCount, filterOptions] = await Promise.all([
    getCampgroundCount(),
    getHomepageFilterOptions(),
  ]);
  const heroStats = [
    {
      icon: TreePine,
      value: `${campgroundCount.toLocaleString()}+`,
      label: "Campgrounds and RV parks",
    },
    {
      icon: TentTree,
      value: "50",
      label: "States covered",
    },
    {
      icon: ShieldCheck,
      value: "Detailed Info",
      label: "Hookups, amenities, site access and more",
    },
  ];

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden bg-[#071916] text-white">
        <Image
          src="/images/sitefinder-hero-mountain-river.png"
          alt="Mountain river campground with an RV at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,25,22,0.86)_0%,rgba(7,25,22,0.54)_47%,rgba(7,25,22,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,rgba(7,25,22,0)_0%,rgba(7,25,22,0.62)_100%)]" />

        <Container className="relative z-10 flex min-h-[640px] items-center pb-12 pt-14 lg:min-h-[680px]">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b8d98d]">
              Your next adventure starts here
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find RV Parks & Campgrounds
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
              Search thousands of RV parks and campgrounds with the details that matter:
              hookups, site access, amenities, and more.
            </p>

            <form action="/campgrounds" className="mt-9 max-w-4xl">
              <div className="grid overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_22px_70px_rgba(0,0,0,0.30)] lg:grid-cols-[1fr_210px_180px_auto]">
                <div className="relative min-w-0 border-b border-border lg:border-b-0 lg:border-r">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by name, city, state, or campground type"
                    className="h-16 w-full bg-white pl-12 pr-4 text-base text-foreground outline-none transition placeholder:text-muted-foreground/72 focus:bg-secondary/35"
                  />
                </div>
                <label className="relative flex h-16 items-center border-b border-border pl-12 pr-4 text-sm font-medium text-foreground lg:border-b-0 lg:border-r">
                  <MapPin className="pointer-events-none absolute left-5 size-4 text-muted-foreground" />
                  <select
                    name="state"
                    defaultValue=""
                    className="w-full appearance-none bg-transparent pr-7 outline-none"
                    aria-label="Location"
                  >
                    <option value="">Any Location</option>
                    {filterOptions.states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 size-4 text-muted-foreground" />
                </label>
                <label className="relative flex h-16 items-center border-b border-border pl-12 pr-4 text-sm font-medium text-foreground lg:border-b-0 lg:border-r">
                  <TentTree className="pointer-events-none absolute left-5 size-4 text-muted-foreground" />
                  <select
                    name="campground_type"
                    defaultValue=""
                    className="w-full appearance-none bg-transparent pr-7 outline-none"
                    aria-label="Campground type"
                  >
                    <option value="">All Types</option>
                    {filterOptions.campgroundTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 size-4 text-muted-foreground" />
                </label>
                <Button type="submit" className="m-3 h-12 shrink-0 rounded-md bg-primary px-6 text-sm font-bold hover:bg-primary/92">
                  Search Campgrounds
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </form>

            <div className="mt-7 grid max-w-4xl gap-5 sm:grid-cols-3">
              {heroStats.map(({ icon: Icon, value, label }, index) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[#67bd8e]/70 bg-[#2f7a58]/70 text-white shadow-[0_0_0_4px_rgba(78,139,102,0.20)]">
                    <Icon className="size-6" />
                  </div>
                  <div className={index > 0 ? "border-l border-white/24 pl-5" : ""}>
                    <p className="text-xl font-bold leading-none text-white sm:text-2xl">{value}</p>
                    <p className="mt-1 max-w-[180px] text-sm leading-5 text-white/78">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
              Built for RV travelers
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The details you need, in one place.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
              We organize the practical information that helps you find the right campground
              for your rig, your trip, and your travel style.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              {
                icon: Plug,
                title: "Hookups",
                body: "Find full hookups, 30 amp, and 50 amp service so you can stay comfortable.",
                cta: "Explore Hookups",
              },
              {
                icon: Map,
                title: "Site Access",
                body: "Filter for pull-through sites, big rig access, site length, and easy in-and-out.",
                cta: "Explore Site Access",
              },
              {
                icon: Waves,
                title: "Comforts",
                body: "Search for Wi-Fi, laundry, showers, pet-friendly stays, pools, and more.",
                cta: "Explore Comforts",
              },
            ].map(({ icon: Icon, title, body, cta }) => (
              <Card key={title} className="rounded-lg border-[#cfd8cb] bg-white shadow-none">
                <CardContent className="flex min-h-[180px] flex-col p-5 sm:p-6">
                  <div className="flex gap-5">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      <Icon className="size-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold leading-tight">{title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                  <Link
                    href={"/campgrounds" as Route}
                    className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-primary hover:text-primary/80"
                  >
                    {cta}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl overflow-hidden rounded-lg border border-[#d6ded2] bg-white md:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Trusted Data", body: "Curated campground information you can rely on." },
              { icon: SlidersHorizontal, title: "Always Growing", body: "New campgrounds added regularly." },
              { icon: Map, title: "Plan With Confidence", body: "Everything you need to choose the right spot." },
              { icon: TentTree, title: "Save Favorites", body: "Build a list of your favorite places." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-4 border-b border-[#d6ded2] p-5 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <Icon className="mt-1 size-7 shrink-0 text-primary" />
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
