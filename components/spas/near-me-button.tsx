"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "idle" | "locating" | "geocoding" | "error";

export function NearMeButton() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleClick() {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    setStatus("locating");
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("geocoding");
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                // Required by Nominatim usage policy
                "Accept-Language": "en",
              },
            }
          );

          if (!res.ok) throw new Error("Geocoding request failed");

          const data = await res.json();
          const addr = data.address ?? {};

          // Nominatim returns city in various fields depending on the locale
          const city: string =
            addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? "";
          const state: string = addr.state ?? addr.region ?? "";
          const country: string = addr.country_code?.toUpperCase() ?? "";

          const params = new URLSearchParams();
          if (city) params.set("city", city);
          if (state) params.set("state", state);
          if (country && country !== "US") params.set("country", country);
          // Pass coordinates + a sentinel so the spas page can do
          // proximity-based fallback when no exact-match results exist.
          params.set("nearme", "1");
          params.set("lat", latitude.toFixed(5));
          params.set("lng", longitude.toFixed(5));

          router.push(`/spas?${params.toString()}`);
          setStatus("idle");
        } catch {
          setErrorMsg("Could not determine your location. Please try again.");
          setStatus("error");
        }
      },
      (err) => {
        if (err.code === 1) {
          setErrorMsg("Location access was denied. Please enable it in your browser settings.");
        } else if (err.code === 3) {
          setErrorMsg("Location request timed out. Please try again.");
        } else {
          setErrorMsg("Could not determine your location. Please try again.");
        }
        setStatus("error");
      },
      { timeout: 10_000, maximumAge: 60_000 }
    );
  }

  const isLoading = status === "locating" || status === "geocoding";
  const label =
    status === "locating"
      ? "Getting location…"
      : status === "geocoding"
      ? "Finding spas…"
      : "Near me";

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isLoading}
        aria-live="polite"
      >
        {isLoading ? (
          <Loader2 data-icon="inline-start" className="size-4 animate-spin" />
        ) : (
          <LocateFixed data-icon="inline-start" className="size-4" />
        )}
        {label}
      </Button>
      {status === "error" && errorMsg && (
        <p className="text-xs text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
