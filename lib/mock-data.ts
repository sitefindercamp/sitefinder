import type { Spa } from "@/types/spa";

export const spaCatalog: Spa[] = [
  {
    id: "1",
    slug: "seoul-heat-club",
    name: "Seoul Heat Club",
    city: "Los Angeles",
    neighborhood: "Koreatown",
    description:
      "A modern urban jjimjilbang concept with warm cedar rooms, late-night lounge seating, and a polished first-timer experience.",
    amenities: ["Salt sauna", "Cold plunge", "Cafe lounge", "Couples area"],
    hours: "Open daily · 8am to 11pm",
    priceLabel: "$42 day pass",
  },
  {
    id: "2",
    slug: "harbor-steam-house",
    name: "Harbor Steam House",
    city: "Orange County",
    neighborhood: "Garden Grove",
    description:
      "Family-friendly spa with wide soaking areas, body scrub services, and a relaxed rhythm that works for all-day stays.",
    amenities: ["Body scrub", "Soaking pools", "Snack bar", "Quiet room"],
    hours: "Open daily · 9am to 10pm",
    priceLabel: "$38 day pass",
  },
  {
    id: "3",
    slug: "pine-and-stone-spa",
    name: "Pine and Stone Spa",
    city: "New York City",
    neighborhood: "Queens",
    description:
      "A neighborhood Korean spa with clay rooms, thoughtful recovery amenities, and a strong regular local crowd.",
    amenities: ["Clay room", "Infrared sauna", "Massage", "Locker service"],
    hours: "Open daily · 7am to 10pm",
    priceLabel: "$46 day pass",
  },
];

export const featuredSpas = spaCatalog;

export const adminStats = [
  {
    label: "Listings in draft",
    value: "12",
    note: "Useful placeholder slot for content workflow metrics.",
  },
  {
    label: "Cities covered",
    value: "5",
    note: "Ready for location expansion, moderation, and publishing status.",
  },
  {
    label: "Pending reviews",
    value: "0",
    note: "Claim flow and user review systems are intentionally not included yet.",
  },
];

export const marketHighlights = [
  { label: "starter metro areas", value: "05" },
  { label: "future amenity filters", value: "18+" },
  { label: "admin-ready routes", value: "04" },
];

export function getSpaBySlug(slug: string) {
  return spaCatalog.find((spa) => spa.slug === slug);
}

export function getSpaById(id: string) {
  return spaCatalog.find((spa) => spa.id === id);
}

