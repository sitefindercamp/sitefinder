import { normalizeAmenitySelection } from "@/lib/amenities";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type SpaStatus = "draft" | "published" | "archived" | "pending";

export type AdminSpa = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  hours_text: string | null;
  pricing_text: string | null;
  what_to_know: string | null;
  important_notes: string | null;
  google_review_url: string | null;
  yelp_review_url: string | null;
  status: SpaStatus;
  is_featured: boolean;
  business_email: string | null;
  business_website: string | null;
  business_phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  day_pass_offered: boolean;
  day_pass_price: string | null;
  listing_categories: string[];
  summary: string | null;
  description: string | null;
  amenities: string[];
};

type SpaPayload = {
  name: string;
  slug: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city: string;
  status: SpaStatus;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  summary?: string | null;
  description?: string | null;
  hours_text?: string | null;
  pricing_text?: string | null;
  what_to_know?: string | null;
  important_notes?: string | null;
  google_review_url?: string | null;
  yelp_review_url?: string | null;
  is_featured?: boolean;
  business_email?: string | null;
  business_website?: string | null;
  business_phone?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  twitter_url?: string | null;
  youtube_url?: string | null;
  day_pass_offered?: boolean;
  day_pass_price?: string | null;
  listing_categories?: string[];
  amenities?: string[];
};

const REQUIRED_LIST_COLUMNS = ["id", "name", "slug", "city", "status"] as const;
const OPTIONAL_COLUMNS = [
  "website",
  "phone",
  "email",
  "address_line_1",
  "address_line_2",
  "state",
  "postal_code",
  "country",
  "summary",
  "description",
  "hours_text",
  "pricing_text",
  "what_to_know",
  "important_notes",
  "google_review_url",
  "yelp_review_url",
  "is_featured",
  "business_email",
  "business_website",
  "business_phone",
  "facebook_url",
  "instagram_url",
  "tiktok_url",
  "twitter_url",
  "youtube_url",
  "day_pass_offered",
  "day_pass_price",
  "listing_categories",
  "amenities",
] as const;

type OptionalColumn = (typeof OPTIONAL_COLUMNS)[number];

function emptyToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractMissingOptionalColumn(message: string, columns: readonly string[]) {
  return columns.find((column) => message.includes(column)) ?? null;
}

function normalizeAmenities(values: FormDataEntryValue[]) {
  return normalizeAmenitySelection(
    values
    .filter((value): value is string => typeof value === "string")
    .map((item) => item.trim())
    .filter(Boolean)
  );
}

function normalizeMultiValue(values: FormDataEntryValue[]) {
  return values
    .filter((value): value is string => typeof value === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function selectManyWithOptionalColumns(requiredColumns: readonly string[]) {
  const supabase = createSupabaseAdminClient();
  let activeOptionalColumns = [...OPTIONAL_COLUMNS];

  while (true) {
    const selectedColumns = [...requiredColumns, ...activeOptionalColumns].join(", ");
    const { data, error } = await supabase
      .from("spas")
      .select(selectedColumns)
      .order("id", { ascending: false });

    if (!error) {
      return { data: data ?? [], missingColumns: OPTIONAL_COLUMNS.filter((column) => !activeOptionalColumns.includes(column)) };
    }

    const missingColumn = extractMissingOptionalColumn(error.message, activeOptionalColumns);

    if (!missingColumn) {
      throw new Error(`Failed to load admin spas: ${error.message}`);
    }

    activeOptionalColumns = activeOptionalColumns.filter((column) => column !== missingColumn);
  }
}

async function selectSingleWithOptionalColumns(id: string) {
  const supabase = createSupabaseAdminClient();
  let activeOptionalColumns = [...OPTIONAL_COLUMNS];

  while (true) {
    const selectedColumns = [...REQUIRED_LIST_COLUMNS, ...activeOptionalColumns].join(", ");
    const { data, error } = await supabase
      .from("spas")
      .select(selectedColumns)
      .eq("id", id)
      .maybeSingle();

    if (!error) {
      return {
        data,
        missingColumns: OPTIONAL_COLUMNS.filter((column) => !activeOptionalColumns.includes(column)),
      };
    }

    const missingColumn = extractMissingOptionalColumn(error.message, activeOptionalColumns);

    if (!missingColumn) {
      throw new Error(`Failed to load spa: ${error.message}`);
    }

    activeOptionalColumns = activeOptionalColumns.filter((column) => column !== missingColumn);
  }
}

function applyMissingColumnDefaults(
  row: Record<string, unknown>,
  missingColumns: OptionalColumn[]
): AdminSpa {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    website: missingColumns.includes("website")
      ? null
      : ((row.website as string | null | undefined) ?? null),
    phone: missingColumns.includes("phone")
      ? null
      : ((row.phone as string | null | undefined) ?? null),
    email: missingColumns.includes("email")
      ? null
      : ((row.email as string | null | undefined) ?? null),
    address_line_1: missingColumns.includes("address_line_1")
      ? null
      : ((row.address_line_1 as string | null | undefined) ?? null),
    address_line_2: missingColumns.includes("address_line_2")
      ? null
      : ((row.address_line_2 as string | null | undefined) ?? null),
    city: String(row.city ?? ""),
    status: (row.status as SpaStatus | undefined) ?? "draft",
    state: missingColumns.includes("state") ? null : ((row.state as string | null | undefined) ?? null),
    postal_code: missingColumns.includes("postal_code")
      ? null
      : ((row.postal_code as string | null | undefined) ?? null),
    country: missingColumns.includes("country")
      ? null
      : ((row.country as string | null | undefined) ?? null),
    summary: missingColumns.includes("summary")
      ? null
      : ((row.summary as string | null | undefined) ?? null),
    description: missingColumns.includes("description")
      ? null
      : ((row.description as string | null | undefined) ?? null),
    hours_text: missingColumns.includes("hours_text")
      ? null
      : ((row.hours_text as string | null | undefined) ?? null),
    pricing_text: missingColumns.includes("pricing_text")
      ? null
      : ((row.pricing_text as string | null | undefined) ?? null),
    what_to_know: missingColumns.includes("what_to_know")
      ? null
      : ((row.what_to_know as string | null | undefined) ?? null),
    important_notes: missingColumns.includes("important_notes")
      ? null
      : ((row.important_notes as string | null | undefined) ?? null),
    google_review_url: missingColumns.includes("google_review_url")
      ? null
      : ((row.google_review_url as string | null | undefined) ?? null),
    yelp_review_url: missingColumns.includes("yelp_review_url")
      ? null
      : ((row.yelp_review_url as string | null | undefined) ?? null),
    is_featured: missingColumns.includes("is_featured")
      ? false
      : Boolean(row.is_featured),
    business_email: missingColumns.includes("business_email")
      ? null
      : ((row.business_email as string | null | undefined) ?? null),
    business_website: missingColumns.includes("business_website")
      ? null
      : ((row.business_website as string | null | undefined) ?? null),
    business_phone: missingColumns.includes("business_phone")
      ? null
      : ((row.business_phone as string | null | undefined) ?? null),
    facebook_url: missingColumns.includes("facebook_url")
      ? null
      : ((row.facebook_url as string | null | undefined) ?? null),
    instagram_url: missingColumns.includes("instagram_url")
      ? null
      : ((row.instagram_url as string | null | undefined) ?? null),
    tiktok_url: missingColumns.includes("tiktok_url")
      ? null
      : ((row.tiktok_url as string | null | undefined) ?? null),
    twitter_url: missingColumns.includes("twitter_url")
      ? null
      : ((row.twitter_url as string | null | undefined) ?? null),
    youtube_url: missingColumns.includes("youtube_url")
      ? null
      : ((row.youtube_url as string | null | undefined) ?? null),
    day_pass_offered: missingColumns.includes("day_pass_offered")
      ? false
      : Boolean(row.day_pass_offered),
    day_pass_price: missingColumns.includes("day_pass_price")
      ? null
      : ((row.day_pass_price as string | null | undefined) ?? null),
    listing_categories: missingColumns.includes("listing_categories")
      ? []
      : Array.isArray(row.listing_categories)
        ? row.listing_categories.map((value) => String(value))
        : [],
    amenities: missingColumns.includes("amenities")
      ? []
      : Array.isArray(row.amenities)
        ? normalizeAmenitySelection(row.amenities.map((value) => String(value)))
        : [],
  };
}

function toRowRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Unexpected Supabase row shape.");
  }

  return value as Record<string, unknown>;
}

export async function listAdminSpas() {
  const { data, missingColumns } = await selectManyWithOptionalColumns(REQUIRED_LIST_COLUMNS);
  return data.map((row) =>
    applyMissingColumnDefaults(toRowRecord(row), missingColumns)
  );
}

export async function getAdminSpaById(id: string) {
  const { data, missingColumns } = await selectSingleWithOptionalColumns(id);

  if (!data) {
    return null;
  }

  return applyMissingColumnDefaults(toRowRecord(data), missingColumns);
}

function buildSpaPayload(formData: FormData): SpaPayload {
  const rawName = formData.get("name");
  const rawCity = formData.get("city");
  const rawStatus = formData.get("status");

  if (
    typeof rawName !== "string" ||
    typeof rawCity !== "string" ||
    typeof rawStatus !== "string"
  ) {
    throw new Error("Missing required spa fields.");
  }

  const name = rawName.trim();
  const city = rawCity.trim();
  const status = rawStatus as SpaStatus;

  if (!name || !city || !["draft", "published", "archived", "pending"].includes(status)) {
    throw new Error("Invalid spa form data.");
  }

  const rawSlug = formData.get("slug");
  const slug =
    typeof rawSlug === "string" && rawSlug.trim().length > 0
      ? toSlug(rawSlug)
      : toSlug(name);

  const payload: SpaPayload = {
    name,
    slug,
    website: emptyToNull(formData.get("website")),
    phone: emptyToNull(formData.get("phone")),
    email: emptyToNull(formData.get("email")),
    address_line_1: emptyToNull(formData.get("address_line_1")),
    address_line_2: emptyToNull(formData.get("address_line_2")),
    city,
    status,
    state: emptyToNull(formData.get("state")),
    postal_code: emptyToNull(formData.get("postal_code")),
    country: emptyToNull(formData.get("country")),
    summary: emptyToNull(formData.get("summary")),
    description: emptyToNull(formData.get("description")),
    hours_text: emptyToNull(formData.get("hours_text")),
    pricing_text: emptyToNull(formData.get("pricing_text")),
    what_to_know: emptyToNull(formData.get("what_to_know")),
    important_notes: emptyToNull(formData.get("important_notes")),
    google_review_url: emptyToNull(formData.get("google_review_url")),
    yelp_review_url: emptyToNull(formData.get("yelp_review_url")),
    is_featured: formData.get("is_featured") === "on",
    facebook_url: emptyToNull(formData.get("facebook_url")),
    instagram_url: emptyToNull(formData.get("instagram_url")),
    tiktok_url: emptyToNull(formData.get("tiktok_url")),
    twitter_url: emptyToNull(formData.get("twitter_url")),
    youtube_url: emptyToNull(formData.get("youtube_url")),
    day_pass_offered: formData.get("day_pass_offered") === "yes",
    day_pass_price: emptyToNull(formData.get("day_pass_price")),
    listing_categories: normalizeMultiValue(formData.getAll("listing_categories")),
    amenities: normalizeAmenities(formData.getAll("amenities")),
  };

  if (formData.has("business_email")) {
    payload.business_email = emptyToNull(formData.get("business_email"));
  }

  if (formData.has("business_website")) {
    payload.business_website = emptyToNull(formData.get("business_website"));
  }

  if (formData.has("business_phone")) {
    payload.business_phone = emptyToNull(formData.get("business_phone"));
  }

  return payload;
}

async function writeSpaWithFallback(
  mode: "create" | "update",
  payload: SpaPayload,
  id?: string
): Promise<{ id: string }> {
  const supabase = createSupabaseAdminClient();
  const optionalKeys: OptionalColumn[] = [
    "website",
    "phone",
    "email",
    "address_line_1",
    "address_line_2",
    "state",
    "postal_code",
    "country",
    "summary",
    "description",
    "hours_text",
    "pricing_text",
    "what_to_know",
    "important_notes",
    "google_review_url",
    "yelp_review_url",
    "is_featured",
    "business_email",
    "business_website",
    "business_phone",
    "facebook_url",
    "instagram_url",
    "tiktok_url",
    "twitter_url",
    "youtube_url",
    "day_pass_offered",
    "day_pass_price",
    "listing_categories",
    "amenities",
  ];

  let activePayload: Record<string, unknown> = { ...payload };

  while (true) {
    const query =
      mode === "create"
        ? supabase.from("spas").insert(activePayload).select("id").single()
        : supabase.from("spas").update(activePayload).eq("id", id).select("id").single();

    const { data, error } = await query;

    if (!error) {
      return { id: String(data.id) };
    }

    const missingKey = extractMissingOptionalColumn(error.message, optionalKeys);

    if (!missingKey || !(missingKey in activePayload)) {
      throw new Error(`Failed to ${mode} spa: ${error.message}`);
    }

    const rest = { ...activePayload };
    delete rest[missingKey];
    activePayload = rest;
  }
}

export async function createAdminSpa(formData: FormData) {
  const payload = buildSpaPayload(formData);
  return writeSpaWithFallback("create", payload);
}

export async function updateAdminSpa(id: string, formData: FormData) {
  const payload = buildSpaPayload(formData);
  return writeSpaWithFallback("update", payload, id);
}

export async function deleteAdminSpa(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("spas").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete spa: ${error.message}`);
  }
}

/** Update only the status field of a spa. Used by quick-action buttons in the admin list. */
export async function updateSpaStatus(
  id: string,
  status: SpaStatus
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("spas")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update spa status: ${error.message}`);
  }
}

export async function getPublishedSpaBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spas")
    .select("id, slug, name, city, state")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error(`Failed to load spa: ${error.message}`);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: String(data.id ?? ""),
    slug: data.slug ?? slug,
    name: data.name ?? "Untitled spa",
    city: data.city ?? null,
    state: data.state ?? null,
  };
}
