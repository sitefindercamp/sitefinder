import { listAdminSpas, type AdminSpa } from "./admin-spas";
import { detectDuplicates } from "./duplicate-detection";
import { listImportRuns, type ImportRun } from "./import-runs";
import { calculateQualityScore, type SpaQualityScore } from "./quality-score";
import { getSpaIdsWithImages } from "./spa-images";
import { createSupabaseAdminClient } from "./supabase/server";

export type SpaWithMeta = AdminSpa & {
  hasImages: boolean;
  quality: SpaQualityScore;
};

export type AdminStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
  pending: number;
  featured: number;
  missingWebsite: number;
  missingPhone: number;
  missingAddress: number;
  missingHours: number;
  missingAmenities: number;
  missingImages: number;
  possibleDuplicates: number;
  totalReviews: number;
  pendingReviews: number;
  needsAttention: SpaWithMeta[];
  recentImports: ImportRun[];
};

/**
 * Fetches all data needed for the admin dashboard in parallel.
 * Returns real counts — no mock data.
 */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createSupabaseAdminClient();

  const [spas, spaIdsWithImages, allImports, reviewCountResult, pendingReviewResult] =
    await Promise.all([
      listAdminSpas(),
      getSpaIdsWithImages(),
      listImportRuns(),
      supabase.from("spa_reviews").select("id", { count: "exact", head: true }),
      supabase
        .from("spa_reviews")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

  const recentImports = allImports.slice(0, 5);

  const withMeta: SpaWithMeta[] = spas.map((spa) => {
    const hasImages = spaIdsWithImages.has(spa.id);
    return {
      ...spa,
      hasImages,
      quality: calculateQualityScore(spa, hasImages),
    };
  });

  const duplicateGroups = detectDuplicates(spas);
  const possibleDuplicates = duplicateGroups.reduce(
    (acc, g) => acc + g.spas.length,
    0
  );

  // All spas sorted worst-first; the page component handles pagination.
  const needsAttention = [...withMeta].sort(
    (a, b) => a.quality.score - b.quality.score
  );

  return {
    total: spas.length,
    published: spas.filter((s) => s.status === "published").length,
    draft: spas.filter((s) => s.status === "draft").length,
    archived: spas.filter((s) => s.status === "archived").length,
    pending: spas.filter((s) => s.status === "pending").length,
    featured: spas.filter((s) => s.is_featured).length,
    missingWebsite: spas.filter((s) => !s.website && !s.business_website).length,
    missingPhone: spas.filter((s) => !s.phone && !s.business_phone).length,
    missingAddress: spas.filter(
      (s) => !s.address_line_1 || !s.city || !s.state
    ).length,
    missingHours: spas.filter((s) => !s.hours_text).length,
    missingAmenities: spas.filter((s) => s.amenities.length === 0).length,
    missingImages: spas.filter((s) => !spaIdsWithImages.has(s.id)).length,
    possibleDuplicates,
    totalReviews: reviewCountResult.count ?? 0,
    pendingReviews: pendingReviewResult.count ?? 0,
    needsAttention,
    recentImports,
  };
}
