import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "About | SiteFinder.Camp",
  description:
    "SiteFinder.Camp is a searchable RV park and campground database built around practical camping details.",
};

const FOCUS_POINTS = [
  "Clear, useful listings",
  "Important details upfront",
  "Helpful planning context",
  "Easy browsing by location and features",
  "Helping businesses get discovered",
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <Container className="max-w-3xl py-16">

        {/* Header */}
        <div className="mb-14 border-b border-border pb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            About us
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
            A clearer way to compare campgrounds.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            SiteFinder.Camp is a searchable database for RV parks, campgrounds,
            and practical camping destinations.
          </p>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            We created this platform to make campground research easier. Whether
            you need full hookups, 50 amp service, pull-through sites, showers,
            laundry, pet-friendly stays, or monthly options, our goal is to put
            the useful details in one place.
          </p>
        </div>

        {/* Why We Exist */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold">Why we exist</h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Finding the right campground online can be frustrating. Information is
            often outdated, scattered across multiple websites, or missing the
            details people actually care about. We built this directory to solve
            that problem by creating a cleaner, more user-friendly way to browse
            and discover.
          </p>
          <p className="mt-4 mb-6 text-base leading-8 text-muted-foreground">
            We focus on:
          </p>
          <ul className="space-y-3">
            {FOCUS_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 shrink-0 text-primary" />
                <span className="text-base text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Two-column cards */}
        <div className="mb-14 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-muted/30 p-7">
            <h2 className="text-xl font-semibold">For campers</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We want every traveler to feel confident before they go. That means
              giving you access to helpful information like amenities, pricing,
              contact details, stay options, and what to expect before booking.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Whether you&apos;re planning a weekend stop or looking for a reliable
              long-stay option, we&apos;re here to help you compare smarter.
            </p>
            <Link
              href={"/campgrounds" as Route}
              className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Browse the directory →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-7">
            <h2 className="text-xl font-semibold">For campground owners</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We believe great businesses deserve visibility. Our platform gives
              owners the opportunity to showcase what makes their campground
              special, connect with new customers, and stand out in a growing
              marketplace.
            </p>
            <Link
              href={"/submit" as Route}
              className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Submit your campground →
            </Link>
          </div>
        </div>

        {/* Mission */}
        <section className="rounded-2xl bg-primary px-8 py-10 text-primary-foreground">
          <p className="text-xs font-medium uppercase tracking-widest opacity-75">
            Our mission
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-snug">
            Make discovering great places easier.
          </h2>
          <p className="mt-4 text-base leading-8 opacity-85">
            We&apos;re continually improving the platform, expanding listings, and
            creating a better experience for both visitors and businesses.
            Thanks for being here and being part of the journey.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              href={"/campgrounds" as Route}
              className="rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition hover:opacity-90"
            >
              Explore campgrounds
            </Link>
            <Link
              href={"/contact" as Route}
              className="rounded-full border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              Get in touch
            </Link>
          </div>
        </section>

      </Container>
    </div>
  );
}
