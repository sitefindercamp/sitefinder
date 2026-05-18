/**
 * Preset CTA block variants used in guide content.
 * Kept in a separate file so client components can import it
 * without pulling in server-only Supabase code.
 */
export const CTA_VARIANTS = {
  general: {
    label: "General discovery",
    heading: "Find a campground for your next stop",
    body: "Browse RV parks and campgrounds with practical details like hookups, site access, amenities, and stay options.",
    linkText: "Search the directory →",
    href: "/campgrounds",
  },
  "day-pass": {
    label: "Hookups",
    heading: "Need full hookups?",
    body: "Filter for full hookups, 30 amp, 50 amp, dump stations, showers, laundry, and other RV-ready essentials.",
    linkText: "Browse hookup-friendly campgrounds →",
    href: "/campgrounds?amenities=full_hookups",
  },
  "first-time": {
    label: "First camping trip",
    heading: "Planning your first campground stay?",
    body: "Compare locations, campground types, pet policies, site access, and amenities before you roll in.",
    linkText: "Find a campground →",
    href: "/campgrounds",
  },
  "body-scrub": {
    label: "Big-rig access",
    heading: "Traveling with a larger rig?",
    body: "Look for big-rig friendly parks, pull-through sites, and practical details that make arrival easier.",
    linkText: "Find big-rig friendly sites →",
    href: "/campgrounds?amenities=big_rig_friendly",
  },
  couples: {
    label: "Longer stays",
    heading: "Looking for a longer stay?",
    body: "Search for campgrounds that support monthly stays, pet-friendly travel, laundry, Wi-Fi, and other comforts.",
    linkText: "Browse monthly stays →",
    href: "/campgrounds?amenities=monthly_stays",
  },
} as const;

export type CtaVariant = keyof typeof CTA_VARIANTS;
