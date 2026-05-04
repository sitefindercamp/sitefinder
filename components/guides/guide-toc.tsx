"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { TocEntry } from "@/lib/guide-utils";

type Props = {
  entries: TocEntry[];
};

export function GuideToc({ entries }: Props) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (entries.length === 0) return;

    const observer = new IntersectionObserver(
      (observed) => {
        // Pick the topmost visible heading
        const visible = observed
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-72px 0px -60% 0px", threshold: 0 }
    );

    const els = entries
      .map((e) => document.getElementById(e.id))
      .filter(Boolean) as HTMLElement[];

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        In this guide
      </p>
      <ul className="space-y-1">
        {entries.map((entry) => (
          <li key={entry.id} className={cn(entry.level === 3 && "pl-3")}>
            <a
              href={`#${entry.id}`}
              className={cn(
                "block rounded py-0.5 transition-colors hover:text-foreground",
                entry.level === 2 ? "font-medium" : "font-normal",
                activeId === entry.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(entry.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                setActiveId(entry.id);
              }}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
