import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { CTA_VARIANTS, type CtaVariant } from "@/lib/cta-variants";
import type { CtaSpa } from "@/lib/spa-cta";

type Props = {
  variant: string;
  spas: CtaSpa[];
};

export function GuideCta({ variant, spas }: Props) {
  const meta = CTA_VARIANTS[variant as CtaVariant] ?? CTA_VARIANTS.general;

  return (
    <div className="guide-cta-card my-10 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02]">
      {/* Header row */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <MapPin className="size-4 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{meta.heading}</p>
          <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{meta.body}</p>
        </div>
      </div>

      {/* Spa mini-cards */}
      {spas.length > 0 && (
        <div className="grid grid-cols-1 gap-2 px-5 pb-4 sm:grid-cols-3">
          {spas.map((spa) => (
            <Link
              key={spa.id}
              href={`/spas/${spa.slug}` as Route}
              className="group flex items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-background/80 p-2.5 transition-colors hover:border-primary/30 hover:bg-background"
            >
              {/* Thumbnail */}
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                {spa.image_url ? (
                  <Image
                    src={spa.image_url}
                    alt={spa.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <MapPin className="size-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>

              {/* Name + location */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {spa.name}
                </p>
                {(spa.city || spa.state) && (
                  <p className="truncate text-xs text-muted-foreground">
                    {[spa.city, spa.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}

      {/* Footer CTA link */}
      <div className="border-t border-primary/10 px-5 py-3">
        <Link
          href={meta.href as Route}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          {meta.linkText}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
