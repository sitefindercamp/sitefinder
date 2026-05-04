import type { AdminSpa } from "./admin-spas";

export type QualityLevel = "strong" | "needs-work" | "incomplete";

export type SpaQualityScore = {
  score: number;
  level: QualityLevel;
  breakdown: {
    website: boolean;
    phone: boolean;
    address: boolean;
    hours: boolean;
    amenities: boolean;
    images: boolean;
  };
};

/**
 * Calculates a 0–100 quality score for a spa listing.
 *
 * Weights:
 *   website  +15  (website or business_website)
 *   phone    +15  (phone or business_phone)
 *   address  +20  (address_line_1 + city + state all present)
 *   hours    +15  (hours_text present)
 *   amenities +15 (at least one amenity)
 *   images   +20  (at least one image in spa_images)
 */
export function calculateQualityScore(
  spa: AdminSpa,
  hasImages: boolean
): SpaQualityScore {
  const website = !!(spa.website || spa.business_website);
  const phone = !!(spa.phone || spa.business_phone);
  const address = !!(spa.address_line_1 && spa.city && spa.state);
  const hours = !!spa.hours_text;
  const amenities = spa.amenities.length > 0;

  const score =
    (website ? 15 : 0) +
    (phone ? 15 : 0) +
    (address ? 20 : 0) +
    (hours ? 15 : 0) +
    (amenities ? 15 : 0) +
    (hasImages ? 20 : 0);

  const level: QualityLevel =
    score >= 80 ? "strong" : score >= 50 ? "needs-work" : "incomplete";

  return {
    score,
    level,
    breakdown: { website, phone, address, hours, amenities, images: hasImages },
  };
}

/** Returns the display label for a quality level. */
export function qualityLabel(level: QualityLevel): string {
  switch (level) {
    case "strong":
      return "Strong";
    case "needs-work":
      return "Needs work";
    case "incomplete":
      return "Incomplete";
  }
}

/** Returns the list of field names that are missing. */
export function getMissingFields(
  breakdown: SpaQualityScore["breakdown"]
): string[] {
  const missing: string[] = [];
  if (!breakdown.website) missing.push("website");
  if (!breakdown.phone) missing.push("phone");
  if (!breakdown.address) missing.push("address");
  if (!breakdown.hours) missing.push("hours");
  if (!breakdown.amenities) missing.push("amenities");
  if (!breakdown.images) missing.push("images");
  return missing;
}
