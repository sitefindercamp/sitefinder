/**
 * Preset CTA block variants used in guide content.
 * Kept in a separate file so client components can import it
 * without pulling in server-only Supabase code.
 */
export const CTA_VARIANTS = {
  general: {
    label: "General discovery",
    heading: "Find a Korean spa near you",
    body: "Browse our full directory of verified Korean spas, jjimjilbangs, and wellness centers across the US.",
    linkText: "Search the directory →",
    href: "/spas",
  },
  "day-pass": {
    label: "Day pass",
    heading: "Ready to book a day pass?",
    body: "Many Korean spas offer unlimited day-pass access to all sauna rooms, baths, and lounges for one flat fee.",
    linkText: "Browse day-pass spas →",
    href: "/spas",
  },
  "first-time": {
    label: "First-time visit",
    heading: "Ready for your first visit?",
    body: "Finding the right spa makes all the difference. Browse listings with photos, hours, and verified details.",
    linkText: "Find a spa near you →",
    href: "/spas",
  },
  "body-scrub": {
    label: "Body scrub / seshin",
    heading: "Looking for a seshin treatment?",
    body: "Body scrub services are available at most Korean spas. Browse listings that offer seshin and exfoliation treatments.",
    linkText: "Find spas with body scrubs →",
    href: "/spas",
  },
  couples: {
    label: "Couples visit",
    heading: "Planning a couples retreat?",
    body: "Many Korean spas have co-ed lounges, couples packages, and amenities designed for two.",
    linkText: "Browse couples-friendly spas →",
    href: "/spas",
  },
} as const;

export type CtaVariant = keyof typeof CTA_VARIANTS;
