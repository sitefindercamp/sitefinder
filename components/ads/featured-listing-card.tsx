/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import type { AdCampaign } from "@/lib/ad-campaigns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function FeaturedListingCard({ campaign }: Props) {
  const href = clickUrl(campaign);
  const imageUrl = campaign.image_url ?? campaign.spa_image_url;
  const location = [campaign.spa_city, campaign.spa_state].filter(Boolean).join(", ");
  const displayName = campaign.spa_name ?? campaign.title;

  return (
    <Card className="h-full overflow-hidden ring-1 ring-primary/25">
      {/* Image */}
      <div className="relative">
        {imageUrl ? (
          <Link href={href as Route} aria-label={displayName}>
            <img
              src={imageUrl}
              alt={displayName}
              className="h-48 w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          </Link>
        ) : (
          <Link
            href={href as Route}
            aria-label={displayName}
            className="flex h-48 w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(14,108,93,0.18),transparent_34%),linear-gradient(135deg,#f4eee5,#fffaf3_48%,#edf4ef)]"
          >
            <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Kspa.online
            </div>
          </Link>
        )}
        {/* Featured badge pinned to image */}
        <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          Featured
        </span>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">
              <Link href={href as Route} className="hover:underline">
                {displayName}
              </Link>
            </CardTitle>
            {location && (
              <p className="mt-1.5 text-sm font-medium text-foreground">{location}</p>
            )}
          </div>
          <div className="rounded-full bg-secondary p-3">
            <MapPin className="size-4 text-primary" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {campaign.spa_summary && (
          <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
            {campaign.spa_summary}
          </p>
        )}
        <div className="pt-2">
          <Link
            href={href as Route}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View details
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
