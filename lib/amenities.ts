export type AmenityDefinition = {
  label: string;
  italic?: boolean;
};

export type AmenityCategory = {
  title: string;
  items: AmenityDefinition[];
};

export const AMENITY_CATEGORIES: AmenityCategory[] = [
  {
    title: "Facility Features",
    items: [
      { label: "Accepts Credit Cards" },
      { label: "24 Hours" },
      { label: "Wheelchair Accessible" },
      { label: "Free Wi-Fi" },
      { label: "Valet Parking" },
      { label: "Elevator" },
    ],
  },
  {
    title: "Layout & Access",
    items: [
      { label: "Gender-Separated Areas" },
      { label: "Co-Ed Lounge" },
    ],
  },
  {
    title: "Co-Ed Social Areas",
    items: [
      { label: "Outdoor Seating" },
      { label: "Childcare" },
      { label: "Smoking Area" },
    ],
  },
  {
    title: "Bathhouse & Saunas",
    items: [
      { label: "Locker Room" },
      { label: "Hot Tub" },
      { label: "Cold Plunge" },
      { label: "Dry Sauna" },
      { label: "Steam Room" },
      { label: "Jade Room" },
      { label: "Cold Room" },
      { label: "Co-Ed Saunas" },
      { label: "Sleeping Area" },
      { label: "Free Drinking Water" },
    ],
  },
  {
    title: "Extra Services (Reservations Required)",
    items: [
      { label: "Korean Body Scrubs" },
      { label: "Massage Services" },
      { label: "Restaurant" },
    ],
  },
] as const;

export const ALL_AMENITY_LABELS = AMENITY_CATEGORIES.flatMap((category) =>
  category.items.map((item) => item.label)
);

const LEGACY_AMENITY_LABELS: Record<string, string> = {
  "24 hours": "24 Hours",
  "24 Hours": "24 Hours",
  "Wireless Internet": "Free Wi-Fi",
  "Free Wifi": "Free Wi-Fi",
  "Gendered Separated": "Gender-Separated Areas",
  "Group Area": "Co-Ed Lounge",
  "Sauna": "Dry Sauna",
  "Sleeping Space": "Sleeping Area",
  "Offers Free Water": "Free Drinking Water",
  "Korean Scrubs": "Korean Body Scrubs",
  "Massage Service": "Massage Services",
  "Reservations": "Reservations Required",
} as const;

export function normalizeAmenityLabel(value: string) {
  const trimmed = value.trim();
  return LEGACY_AMENITY_LABELS[trimmed] ?? trimmed;
}

export function normalizeAmenitySelection(values: string[]) {
  const normalized = values
    .map((value) => normalizeAmenityLabel(value))
    .filter(Boolean);

  return [...new Set(normalized)];
}
