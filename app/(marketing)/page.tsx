import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Plug, Search, ShieldCheck, SlidersHorizontal, TentTree, Waves } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getCampgroundCount() {
  try {
    const supabase = await createSupabaseServerClient();
    const { count, error } = await supabase
      .from("campgrounds")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export default async function HomePage() {
  const campgroundCount = await getCampgroundCount();
  const proofPoints = [
    { value: campgroundCount.toLocaleString(), label: "published listings" },
    { value: "83", label: "source files imported" },
    { value: "50", label: "state-level searching" },
  ];

  return (
    <div className="bg-background">
      <section className="relative isolate min-h-[740px] overflow-hidden bg-[#071916] text-white">
        <Image
          src="/images/sitefinder-hero-mountain-river.png"
          alt="Mountain river campground with an RV at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,25,22,0.94)_0%,rgba(7,25,22,0.72)_43%,rgba(7,25,22,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,rgba(7,25,22,0)_0%,hsl(var(--background))_92%)]" />

        <Container className="relative z-10 flex min-h-[740px] items-center pb-28 pt-20">
          <div className="max-w-4xl">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Find RV parks and campgrounds with the details that matter.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl">
              Search a growing campground database by location, park type, hookups, amp service,
              pull-through access, pet policies, monthly stays, and more.
            </p>

            <form action="/campgrounds" className="mt-9 max-w-4xl">
              <div className="grid gap-3 rounded-lg border border-white/15 bg-white p-3 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:grid-cols-[1fr_auto]">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by name, city, state, zip, or park type"
                    className="h-14 w-full rounded-md bg-secondary/55 pl-12 pr-4 text-base text-foreground outline-none ring-1 ring-border transition focus:bg-white focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" size="lg" className="h-14 shrink-0 bg-primary px-6 text-base hover:bg-primary/92">
                  Search
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-[#d89a32] text-[#071916] hover:bg-[#e5a941]">
                <Link href={"/campgrounds" as Route}>Browse Campgrounds</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/35 bg-white/8 text-white hover:bg-white hover:text-[#071916]">
                <Link href={"/submit" as Route}>Submit a Campground</Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              {proofPoints.map((item) => (
                <div key={item.label} className="border-l border-white/24 pl-4">
                  <p className="text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-white/58">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="-mt-12 pb-16">
        <Container className="relative z-10">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Location-first search",
                body: "Browse by state, city, campground type, or a specific search term.",
              },
              {
                icon: SlidersHorizontal,
                title: "RV-ready filters",
                body: "Filter for full hookups, 30/50 amp, pull-through sites, Wi-Fi, showers, and more.",
              },
              {
                icon: ShieldCheck,
                title: "Structured records",
                body: "Each listing uses a consistent database format for easier comparison.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <Card key={title} className="rounded-lg border-white/70 bg-white/94 shadow-[0_18px_50px_rgba(20,43,34,0.12)] backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-white py-16">
        <Container className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold sm:text-4xl">Narrow the search before you roll in.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              SiteFinder.Camp is built around practical campground fields, so travelers can compare
              the details that change a stay.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Plug, label: "Hookups", body: "Full, 30 amp, 50 amp" },
              { icon: TentTree, label: "Site access", body: "Pull-through and big-rig" },
              { icon: Waves, label: "Comforts", body: "Showers, laundry, pool" },
              { icon: MapPin, label: "Stays", body: "Pet-friendly and monthly" },
            ].map(({ icon: Icon, label, body }) => (
              <div key={label} className="rounded-lg border border-border bg-background p-5">
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
