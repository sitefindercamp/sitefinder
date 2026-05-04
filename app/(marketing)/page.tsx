import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div>
      <section className="border-b border-border bg-[linear-gradient(180deg,#f7fbf8_0%,#ffffff_78%)]">
        <Container className="grid min-h-[620px] items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div>
            <Badge variant="secondary">SiteFinder.Camp</Badge>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Find RV parks and campgrounds with the details that matter.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Search a growing campground database by location, park type, hookups, amp service,
              pull-through access, pet policies, monthly stays, and more.
            </p>

            <form action="/campgrounds" className="mt-8 max-w-2xl">
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search by name, city, state, zip, or type"
                    className="h-11 w-full rounded-md bg-background pl-9 pr-3 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-ring"
                  />
                </div>
                <Button type="submit" className="shrink-0">
                  Search
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </form>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href={"/campgrounds" as Route}>Browse Campgrounds</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={"/submit" as Route}>Submit a Campground</Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-lg">
            <CardContent className="p-6">
              <div className="grid gap-4">
                <div className="rounded-lg border border-border bg-background p-5">
                  <p className="text-sm font-medium text-muted-foreground">Published listings</p>
                  <p className="mt-2 text-4xl font-semibold">{campgroundCount.toLocaleString()}</p>
                </div>
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
                    title: "Structured campground records",
                    body: "Each listing is built from a consistent database format for easier comparison.",
                  },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title} className="flex gap-4 rounded-lg border border-border bg-background p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="py-14">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["Hookups", "Full hookups, 30 amp, and 50 amp fields are ready for filtering."],
              ["Site Access", "Pull-through and big-rig-friendly flags help RV travelers narrow options."],
              ["Comforts", "Wi-Fi, laundry, showers, pool, pet-friendly, monthly stays, and dump station fields are built in."],
            ].map(([title, body]) => (
              <Card key={title} className="rounded-lg">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold">{title}</h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
