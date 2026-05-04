import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

import type { AdCampaign } from "@/lib/ad-campaigns";
import { Badge } from "@/components/ui/badge";

type Props = {
  campaign: AdCampaign;
};

function clickUrl(campaign: AdCampaign) {
  const base = `/api/ads/click?id=${campaign.id}`;
  const to = campaign.target_url
    ? `&to=${encodeURIComponent(campaign.target_url)}`
    : campaign.spa_slug
    ? `&to=${encodeURIComponent(`/spas/${campaign.spa_slug}`)}`
    : "";
  return base + to;
}

export function SponsoredCard({ campaign }: Props) {
  const href = clickUrl(campaign);
  const location = [campaign.spa_city, campaign.spa_state].filter(Boolean).join(", ");

  return (
    <Link
      href={href as Route}
      className="group surface flex flex-col overflow-hidden shadow-[0_18px_52px_-38px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-0.5"
    >
      {/* Image */}
      {campaign.image_url || campaign.spa_image_url ? (
        <div className="relative h-48 w-full shrink-0 overflow-hidden">
          <Image
            src={(campaign.image_url || campaign.spa_image_url)!}
            alt={campaign.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
      ) : (
        <div className="flex h-48 w-full shrink-0 items-center justify-center bg-secondary/50">
          <MapPin className="size-8 text-muted-foreground/30" />
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/10 text-xs">
            Sponsored
          </Badge>
        </div>
        <h3 className="text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {campaign.spa_name ?? campaign.title}
        </h3>
        {location && (
          <p className="text-sm font-medium text-foreground">{location}</p>
        )}
        {campaign.spa_summary && (
          <p className="flex-1 text-sm leading-6 text-muted-foreground line-clamp-2">
            {campaign.spa_summary}
          </p>
        )}
        <p className="mt-1 text-sm font-medium text-primary group-hover:underline">
          View details →
        </p>
      </div>
    </Link>
  );
}
