import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import type { AdCampaign } from "@/lib/ad-campaigns";
import { Button } from "@/components/ui/button";
import { ImpressionTracker } from "@/components/ads/impression-tracker";

export function BannerAd({ campaign }: { campaign: AdCampaign }) {
  const href = `/api/ads/click?id=${campaign.id}${
    campaign.target_url ? `&to=${encodeURIComponent(campaign.target_url)}` : ""
  }`;

  return (
    <>
      <ImpressionTracker campaignIds={[campaign.id]} />
      <section className="relative overflow-hidden rounded-3xl bg-primary">
        {campaign.image_url && (
          <Image
            src={campaign.image_url}
            alt={campaign.title}
            fill
            className="object-cover opacity-20"
          />
        )}
        <div className="relative z-10 flex flex-col items-start gap-4 px-8 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary-foreground/60">
              Sponsored
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-primary-foreground sm:text-3xl">
              {campaign.title}
            </h2>
          </div>
          {campaign.target_url && (
            <Button asChild variant="secondary" size="lg" className="shrink-0">
              <Link href={href as Route}>Learn more</Link>
            </Button>
          )}
        </div>
      </section>
    </>
  );
}
