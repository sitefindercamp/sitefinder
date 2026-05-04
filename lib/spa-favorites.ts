import { createSupabaseAdminClient } from "./supabase/server";

export type FavoritedSpa = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  state: string | null;
  summary: string | null;
  favorited_at: string | null;
};

/** Returns true if the given user has favorited the given spa. */
export async function isSpaFavorited(
  userId: string,
  spaId: string
): Promise<boolean> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("spa_favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("spa_id", spaId)
    .maybeSingle();
  return !!data;
}

/** Add a spa to a user's favorites. Silently ignores duplicates. */
export async function addFavorite(
  userId: string,
  spaId: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("spa_favorites")
    .insert({ user_id: userId, spa_id: spaId });
}

/** Remove a spa from a user's favorites. */
export async function removeFavorite(
  userId: string,
  spaId: string
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("spa_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("spa_id", spaId);
}

/** Fetch all favorited spas for a user, most-recently saved first. */
export async function getUserFavoritedSpas(
  userId: string
): Promise<FavoritedSpa[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_favorites")
    .select(
      `created_at,
       spa:spas ( id, slug, name, city, state, summary )`
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .filter((row) => row.spa)
    .map((row) => {
      // Supabase infers joined rows as arrays even for many-to-one relations;
      // cast through unknown to get the actual single-object shape.
      const spa = (Array.isArray(row.spa) ? row.spa[0] : row.spa) as {
        id: string;
        slug: string;
        name: string;
        city: string | null;
        state: string | null;
        summary: string | null;
      };
      return {
        id: spa.id,
        slug: spa.slug,
        name: spa.name,
        city: spa.city,
        state: spa.state,
        summary: spa.summary,
        favorited_at: row.created_at,
      };
    });
}
