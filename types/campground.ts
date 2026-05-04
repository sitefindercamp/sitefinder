export type Campground = {
  id: string;
  slug: string;
  status: "draft" | "published" | "archived" | "pending";
  name: string;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_range: string | null;
  campground_type: string | null;
  full_hookups: boolean | null;
  amp_30: boolean | null;
  amp_50: boolean | null;
  pull_through: boolean | null;
  big_rig_friendly: boolean | null;
  wifi: boolean | null;
  laundry: boolean | null;
  showers: boolean | null;
  pool: boolean | null;
  pet_friendly: boolean | null;
  monthly_stays: boolean | null;
  dump_station: boolean | null;
  description: string | null;
  is_featured: boolean;
};

export type CampgroundAmenityKey =
  | "full_hookups"
  | "amp_30"
  | "amp_50"
  | "pull_through"
  | "big_rig_friendly"
  | "wifi"
  | "laundry"
  | "showers"
  | "pool"
  | "pet_friendly"
  | "monthly_stays"
  | "dump_station";

export const CAMPGROUND_AMENITIES: Array<{
  key: CampgroundAmenityKey;
  label: string;
}> = [
  { key: "full_hookups", label: "Full hookups" },
  { key: "amp_30", label: "30 amp" },
  { key: "amp_50", label: "50 amp" },
  { key: "pull_through", label: "Pull-through sites" },
  { key: "big_rig_friendly", label: "Big-rig friendly" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "laundry", label: "Laundry" },
  { key: "showers", label: "Showers" },
  { key: "pool", label: "Pool" },
  { key: "pet_friendly", label: "Pet friendly" },
  { key: "monthly_stays", label: "Monthly stays" },
  { key: "dump_station", label: "Dump station" },
];
