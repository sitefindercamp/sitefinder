/** Predefined audience tags used on guide pages. */
export const AUDIENCE_TAGS = [
  { value: "first-timers", label: "First-timers" },
  { value: "solo", label: "Solo visitors" },
  { value: "couples", label: "Couples" },
  { value: "groups", label: "Groups" },
  { value: "families", label: "Families" },
  { value: "budget", label: "Budget-friendly" },
  { value: "luxury", label: "Luxury seekers" },
] as const;

export type AudienceTagValue = (typeof AUDIENCE_TAGS)[number]["value"];
