import { createSupabaseAdminClient } from "@/lib/supabase/server";

/** Canonical pair key — always smaller ID first. */
export function pairKey(id1: string, id2: string): string {
  return id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`;
}

/**
 * Returns a Set of canonical pair keys (smallerId:largerId) that the
 * admin has chosen to ignore.
 */
export async function getIgnoredPairSet(): Promise<Set<string>> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ignored_duplicate_pairs")
    .select("spa_id_a, spa_id_b");

  if (error) {
    console.error("getIgnoredPairSet error:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((r) => `${r.spa_id_a}:${r.spa_id_b}`));
}

/**
 * Stores every pair within a group so that none of those spas are
 * flagged as duplicates of each other again.
 */
export async function ignoreGroup(spaIds: string[]): Promise<void> {
  if (spaIds.length < 2) return;

  const rows: { spa_id_a: string; spa_id_b: string }[] = [];
  for (let i = 0; i < spaIds.length; i++) {
    for (let j = i + 1; j < spaIds.length; j++) {
      const [a, b] =
        spaIds[i] < spaIds[j]
          ? [spaIds[i], spaIds[j]]
          : [spaIds[j], spaIds[i]];
      rows.push({ spa_id_a: a, spa_id_b: b });
    }
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ignored_duplicate_pairs")
    .upsert(rows, { onConflict: "spa_id_a,spa_id_b" });

  if (error) throw new Error(error.message);
}
