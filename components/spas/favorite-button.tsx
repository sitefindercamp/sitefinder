"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleFavoriteAction } from "@/app/(marketing)/account/favorites/actions";
import { cn } from "@/lib/utils";

type FavoriteButtonProps = {
  spaId: string;
  spaSlug: string;
  initialIsFavorited: boolean;
  isLoggedIn: boolean;
};

export function FavoriteButton({
  spaId,
  spaSlug,
  initialIsFavorited,
  isLoggedIn,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialIsFavorited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (!isLoggedIn) {
      window.location.href = `/signin?message=${encodeURIComponent("Please sign in to save favorites")}`;
      return;
    }

    // Optimistic update — flip immediately, revert on error
    setFavorited((prev) => !prev);

    startTransition(async () => {
      try {
        const result = await toggleFavoriteAction(spaId, spaSlug);
        setFavorited(result.favorited);
      } catch {
        setFavorited((prev) => !prev);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={favorited ? "Remove from favorites" : "Save to favorites"}
      aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
      aria-pressed={favorited}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60",
        favorited
          ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
          : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <Heart
        className={cn("size-4 transition-all", favorited && "fill-current")}
      />
      {favorited ? "Saved" : "Save"}
    </button>
  );
}
