import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "About | KSpa Online",
  description:
    "KSpa Online is your trusted guide to discovering Korean spas, jjimjilbangs, and wellness destinations across the United States.",
};

const FOCUS_POINTS = [
  "Clear, useful listings",
  "Important details upfront",
  "Honest reviews and community insights",
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
            Your trusted guide to great wellness destinations.
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Welcome to our directory — your trusted guide to discovering unique
            wellness destinations, hidden gems, and standout places worth
            visiting.
          </p>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            We created this platform to make it easier for people to explore
            businesses with confidence. Whether you&apos;re planning your next
            relaxing getaway, searching for a local favorite, or comparing
            options before you visit, our goal is to bring helpful, organized,
            and easy-to-understand information all in one place.
          </p>
        </div>

        {/* Why We Exist */}
        <section className="mb-14">
          <h2 className="text-2xl font-semibold">Why we exist</h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Finding quality places online can be frustrating. Information is
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
            <h2 className="text-xl font-semibold">For visitors</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We want every visitor to feel confident before they go. That means
              giving you access to helpful information like amenities, pricing,
              contact details, photos, and what to expect before visiting.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Whether you&apos;re a first-time visitor or someone looking for a new
              favorite place, we&apos;re here to help you explore smarter.
            </p>
            <Link
              href={"/spas" as Route}
              className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Browse the directory →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-muted/30 p-7">
            <h2 className="text-xl font-semibold">For business owners</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              We believe great businesses deserve visibility. Our platform gives
              owners the opportunity to showcase what makes their location
              special, connect with new customers, and stand out in a growing
              marketplace.
            </p>
            <Link
              href={"/submit" as Route}
              className="mt-5 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Submit your spa →
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
              href={"/spas" as Route}
              className="rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition hover:opacity-90"
            >
              Explore spas
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
