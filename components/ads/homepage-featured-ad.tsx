import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ExternalLink } from "lucide-react";

import type { AdCampaign } from "@/lib/ad-campaigns";

type Props = {
  campaigns: AdCampaign[];
};

function clickUrl(campaign: AdCampaign): string {
  const base = `/api/ads/click?id=${campaign.id}`;
  const dest = campaign.target_url
    ? campaign.target_url
    : campaign.spa_slug
    ? `/spas/${campaign.spa_slug}`
    : null;
  return dest ? `${base}&to=${encodeURIComponent(dest)}` : base;
}

function HomepageFeaturedCard({ campaign }: { campaign: AdCampaign }) {
  const href = clickUrl(campaign);
  const name = campaign.spa_name ?? campaign.title;
  const location = [campaign.spa_city, campaign.spa_state].filter(Boolean).join(", ");
  const summary = campaign.spa_summary ?? null;
  const image = campaign.image_url ?? campaign.spa_image_url ?? null;

  return (
    <Link
      href={href as Route}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-[0_24px_64px_-32px_rgba(0,0,0,0.3)] ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_72px_-28px_rgba(0,0,0,0.35)] hover:ring-primary/40"
    >
      {/* Image */}
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-secondary/50">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(14,108,93,0.18),transparent_34%),linear-gradient(135deg,#f4eee5,#fffaf3_48%,#edf4ef)]">
            <MapPin className="size-10 text-primary/20" />
          </div>
        )}
        {/* Sponsored badge — top-right corner */}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
          Sponsored
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-6">
        {location && (
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-primary" />
            {location}
          </p>
        )}
        <h3 className="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {name}
        </h3>
        {summary && (
          <p className="flex-1 text-sm leading-6 text-muted-foreground line-clamp-2">
            {summary}
          </p>
        )}
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          View details
          <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

export function HomepageFeaturedAds({ campaigns }: Props) {
  if (campaigns.length === 0) return null;

  // Up to 3 homepage featured slots
  const visible = campaigns.slice(0, 3);

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Sponsored
            </p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Featured destinations
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Promoted Korean spa experiences from our advertising partners.
            </p>
          </div>
        </div>

        <div
          className={
            visible.length === 1
              ? "mt-10 max-w-md"
              : visible.length === 2
              ? "mt-10 grid gap-5 md:grid-cols-2 max-w-3xl"
              : "mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          }
        >
          {visible.map((campaign) => (
            <HomepageFeaturedCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  );
}
