export type USState = {
  name: string;
  abbr: string;
  slug: string;
};

export const US_STATES: USState[] = [
  { name: "Alabama", abbr: "AL", slug: "alabama" },
  { name: "Alaska", abbr: "AK", slug: "alaska" },
  { name: "Arizona", abbr: "AZ", slug: "arizona" },
  { name: "Arkansas", abbr: "AR", slug: "arkansas" },
  { name: "California", abbr: "CA", slug: "california" },
  { name: "Colorado", abbr: "CO", slug: "colorado" },
  { name: "Connecticut", abbr: "CT", slug: "connecticut" },
  { name: "Delaware", abbr: "DE", slug: "delaware" },
  { name: "Florida", abbr: "FL", slug: "florida" },
  { name: "Georgia", abbr: "GA", slug: "georgia" },
  { name: "Hawaii", abbr: "HI", slug: "hawaii" },
  { name: "Idaho", abbr: "ID", slug: "idaho" },
  { name: "Illinois", abbr: "IL", slug: "illinois" },
  { name: "Indiana", abbr: "IN", slug: "indiana" },
  { name: "Iowa", abbr: "IA", slug: "iowa" },
  { name: "Kansas", abbr: "KS", slug: "kansas" },
  { name: "Kentucky", abbr: "KY", slug: "kentucky" },
  { name: "Louisiana", abbr: "LA", slug: "louisiana" },
  { name: "Maine", abbr: "ME", slug: "maine" },
  { name: "Maryland", abbr: "MD", slug: "maryland" },
  { name: "Massachusetts", abbr: "MA", slug: "massachusetts" },
  { name: "Michigan", abbr: "MI", slug: "michigan" },
  { name: "Minnesota", abbr: "MN", slug: "minnesota" },
  { name: "Mississippi", abbr: "MS", slug: "mississippi" },
  { name: "Missouri", abbr: "MO", slug: "missouri" },
  { name: "Montana", abbr: "MT", slug: "montana" },
  { name: "Nebraska", abbr: "NE", slug: "nebraska" },
  { name: "Nevada", abbr: "NV", slug: "nevada" },
  { name: "New Hampshire", abbr: "NH", slug: "new-hampshire" },
  { name: "New Jersey", abbr: "NJ", slug: "new-jersey" },
  { name: "New Mexico", abbr: "NM", slug: "new-mexico" },
  { name: "New York", abbr: "NY", slug: "new-york" },
  { name: "North Carolina", abbr: "NC", slug: "north-carolina" },
  { name: "North Dakota", abbr: "ND", slug: "north-dakota" },
  { name: "Ohio", abbr: "OH", slug: "ohio" },
  { name: "Oklahoma", abbr: "OK", slug: "oklahoma" },
  { name: "Oregon", abbr: "OR", slug: "oregon" },
  { name: "Pennsylvania", abbr: "PA", slug: "pennsylvania" },
  { name: "Rhode Island", abbr: "RI", slug: "rhode-island" },
  { name: "South Carolina", abbr: "SC", slug: "south-carolina" },
  { name: "South Dakota", abbr: "SD", slug: "south-dakota" },
  { name: "Tennessee", abbr: "TN", slug: "tennessee" },
  { name: "Texas", abbr: "TX", slug: "texas" },
  { name: "Utah", abbr: "UT", slug: "utah" },
  { name: "Vermont", abbr: "VT", slug: "vermont" },
  { name: "Virginia", abbr: "VA", slug: "virginia" },
  { name: "Washington", abbr: "WA", slug: "washington" },
  { name: "West Virginia", abbr: "WV", slug: "west-virginia" },
  { name: "Wisconsin", abbr: "WI", slug: "wisconsin" },
  { name: "Wyoming", abbr: "WY", slug: "wyoming" },
  { name: "Washington D.C.", abbr: "DC", slug: "washington-dc" },
];

/** O(1) lookup by URL slug, e.g. "california" → { name, abbr, slug } */
export const US_STATE_BY_SLUG = new Map<string, USState>(
  US_STATES.map((s) => [s.slug, s])
);

/** O(1) lookup by state abbreviation, e.g. "CA" → California */
export const US_STATE_BY_ABBR = new Map<string, USState>(
  US_STATES.map((s) => [s.abbr.toUpperCase(), s])
);

/**
 * Converts a DB state value ("California", "CA", "california") → slug ("california").
 * Returns null if no match is found.
 */
export function stateToSlug(dbValue: string): string | null {
  const trimmed = dbValue.trim();

  // Try abbr match (CA, TX, etc.)
  const byAbbr = US_STATE_BY_ABBR.get(trimmed.toUpperCase());
  if (byAbbr) return byAbbr.slug;

  // Try full-name match (case-insensitive)
  const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
  if (US_STATE_BY_SLUG.has(slug)) return slug;

  return null;
}

/**
 * Converts a city name to a URL slug.
 * "Los Angeles" → "los-angeles"
 */
export function cityToSlug(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Converts a URL slug back to a display-friendly city name.
 * "los-angeles" → "Los Angeles"
 */
export function slugToCity(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
