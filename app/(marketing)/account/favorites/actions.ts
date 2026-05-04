"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addFavorite, isSpaFavorited, removeFavorite } from "@/lib/spa-favorites";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Toggle the favorite state for a spa.
 * Called from the FavoriteButton client component via a server action.
 * Returns the new favorited state so the client can stay in sync.
 */
export async function toggleFavoriteAction(
  spaId: string,
  spaSlug: string
): Promise<{ favorited: boolean }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/signin?message=${encodeURIComponent("Please sign in to save favorites")}` as Route
    );
  }

  const already = await isSpaFavorited(user.id, spaId);
  if (already) {
    await removeFavorite(user.id, spaId);
  } else {
    await addFavorite(user.id, spaId);
  }

  revalidatePath(`/spas/${spaSlug}` as Route);
  revalidatePath("/account/favorites" as Route);

  return { favorited: !already };
}
