"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget impression tracking.
 * Renders nothing — just calls the impression API once on mount.
 */
export function ImpressionTracker({ campaignIds }: { campaignIds: string[] }) {
  useEffect(() => {
    if (campaignIds.length === 0) return;
    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignIds }),
    }).catch(() => {/* best-effort */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
