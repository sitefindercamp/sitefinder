import type { Metadata } from "next";
import { BarChart2, Clock, Lock, MapPin, Star, TrendingUp, Zap } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAdvertisingLeadAction } from "./actions";

export const metadata: Metadata = {
  title: "Advertise | KSpa Online",
  description:
    "Reach people actively searching for Korean spas, jjimjilbangs, saunas, and wellness experiences.",
};

type Props = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

const PACKAGES = [
  {
    icon: Star,
    title: "Featured Listing",
    description:
      "Appear at the top of search results with a Featured badge. Ideal for spas that want to stand out in the directory.",
    price: "Starting at $49/mo",
  },
  {
    icon: TrendingUp,
    title: "Sponsored Directory Placement",
    description:
      "Pin your listing as a Sponsored card above all organic results on the /spas browse page.",
    price: "Starting at $79/mo",
  },
  {
    icon: Zap,
    title: "Homepage Placement",
    description:
      "Feature your spa in the curated homepage section seen by every visitor who lands on KSpa.online.",
    price: "Starting at $149/mo",
  },
  {
    icon: BarChart2,
    title: "Banner Ads",
    description:
      "Brand-level visibility with a full-width banner between sections. Includes click and impression reporting.",
    price: "Starting at $99/mo",
  },
];

const BENEFITS = [
  { icon: MapPin,      label: "Reach visitors actively searching for Korean spas" },
  { icon: TrendingUp,  label: "Increase discovery and drive more walk-ins" },
  { icon: Star,        label: "Promote specials, openings, and seasonal offers" },
  { icon: BarChart2,   label: "Simple click + impression reporting included" },
];

export default async function AdvertisePage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;
  const success = params?.success === "1";

  return (
    <div className="pb-24">
      {/* Hero */}
      <section className="border-b border-border bg-primary py-20 text-primary-foreground">
        <Container className="max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/60">
            Partner with us
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Advertise on KSpa Online
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/75">
            Reach people actively searching for Korean spas, jjimjilbangs,
            saunas, and wellness experiences — right when they&apos;re ready to book.
          </p>
        </Container>
      </section>

      {/* Founding Advertiser waitlist */}
      <section className="border-b border-border bg-accent/40 py-14">
        <Container className="max-w-3xl">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                <Clock className="size-3" />
                Now accepting founding advertisers
              </div>
              <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
                Lock in our lowest rate — ever.
              </h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-muted-foreground">
                We&apos;re in early launch and offering founding advertiser pricing to
                the first businesses that get on board. Rates will increase as
                the directory grows. Join the waitlist and we&apos;ll reach out before
                spots fill.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="size-4 shrink-0 text-primary" />
                  Founding rate locked in for the life of your campaign
                </li>
                <li className="flex items-center gap-2">
                  <Star className="size-4 shrink-0 text-primary" />
                  First pick of premium placements before public launch
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="size-4 shrink-0 text-primary" />
                  No commitment — just let us know you&apos;re interested
                </li>
              </ul>
            </div>
            <a
              href="#contact"
              className="shrink-0 rounded-2xl bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              Join the waitlist →
            </a>
          </div>
        </Container>
      </section>

      {/* Packages */}
      <section className="py-20">
        <Container>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Advertising options
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Choose your placement</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGES.map(({ icon: Icon, title, description, price }) => (
              <div key={title} className="surface flex flex-col gap-4 p-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
                <p className="mt-auto text-sm font-semibold text-primary">{price}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section className="border-y border-border bg-secondary/30 py-16">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <p className="text-base font-medium">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Lead form */}
      <section className="py-20" id="contact">
        <Container className="max-w-2xl">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Reserve your spot
            </p>
            <h2 className="mt-3 text-3xl font-semibold">Join the founding advertiser waitlist</h2>
            <p className="mt-4 text-muted-foreground">
              Drop us your details and we&apos;ll reach out personally before spots open to the public. No commitment required.
            </p>
          </div>

          {success ? (
            <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 px-6 py-10 text-center">
              <p className="text-2xl font-semibold text-green-800">You&apos;re on the list!</p>
              <p className="mt-2 text-green-700">
                We&apos;ll reach out personally before spots open to the public. Thanks for your interest.
              </p>
            </div>
          ) : (
            <form action={submitAdvertisingLeadAction} className="mt-10 flex flex-col gap-5">
              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" placeholder="Your name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" placeholder="you@example.com" required />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="company_name">Spa / Business Name</Label>
                  <Input id="company_name" name="company_name" placeholder="Aqua Day Spa" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" type="url" placeholder="https://yourspa.com" />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="interest">I&apos;m interested in</Label>
                <select
                  id="interest"
                  name="interest"
                  className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select an option…</option>
                  <option value="featured_listing">Featured Listing</option>
                  <option value="sponsored_placement">Sponsored Directory Placement</option>
                  <option value="homepage_placement">Homepage Placement</option>
                  <option value="banner_ad">Banner Ad</option>
                  <option value="not_sure">Not Sure — Tell Me More</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your spa or campaign goals…"
                />
              </div>

              <Button type="submit" size="lg" className="self-start">
                Join the waitlist
              </Button>
            </form>
          )}
        </Container>
      </section>
    </div>
  );
}
