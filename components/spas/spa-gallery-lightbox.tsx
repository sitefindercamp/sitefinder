"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LightboxImage = {
  id: string;
  public_url: string;
  alt: string;
};

type SpaGalleryLightboxProps = {
  images: LightboxImage[];
};

export function SpaGalleryLightbox({ images }: SpaGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) {
    return null;
  }

  const activeImage = activeIndex === null ? null : images[activeIndex];

  const openImage = (index: number) => setActiveIndex(index);
  const closeImage = () => setActiveIndex(null);
  const showPrevious = () =>
    setActiveIndex((current) =>
      current === null ? current : (current - 1 + images.length) % images.length
    );
  const showNext = () =>
    setActiveIndex((current) =>
      current === null ? current : (current + 1) % images.length
    );

  return (
    <>
      <Card className="rounded-[24px] shadow-none">
        <CardHeader>
          <CardTitle>Gallery</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => openImage(index)}
              className="overflow-hidden rounded-2xl border border-border bg-secondary/20 text-left transition hover:border-primary/40 hover:shadow-sm"
            >
              <img
                src={image.public_url}
                alt={image.alt}
                className="aspect-[4/3] w-full object-cover"
              />
            </button>
          ))}
        </CardContent>
      </Card>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeImage}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeImage}
              className="absolute right-3 top-3 z-10 inline-flex rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              aria-label="Close gallery"
            >
              <X className="size-5" />
            </button>

            {images.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute left-3 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full p-0"
                  onClick={showPrevious}
                >
                  <ChevronLeft className="size-5" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute right-3 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full p-0"
                  onClick={showNext}
                >
                  <ChevronRight className="size-5" />
                </Button>
              </>
            ) : null}

            <img
              src={activeImage.public_url}
              alt={activeImage.alt}
              className="max-h-[85vh] w-full rounded-3xl object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
