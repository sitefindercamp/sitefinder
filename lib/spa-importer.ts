import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createImportRun, recordImportError } from "@/lib/import-runs";
import { normalizeAmenitySelection } from "@/lib/amenities";

// ── CSV parser ────────────────────────────────────────────────────────────────

export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cell);
        cell = "";
      } else if (char === "\r" && next === "\n") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
        i++;
      } else if (char === "\n" || char === "\r") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += char;
      }
    }
  }

  if (row.length > 0 || cell.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // Drop empty trailing rows
  while (rows.length > 0 && rows[rows.length - 1].every((c) => c.trim() === "")) {
    rows.pop();
  }

  return rows;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toBool(value: string): boolean {
  return ["true", "yes", "1"].includes(value.toLowerCase().trim());
}

function toPipe(value: string): string[] {
  return value
    .split("|")
    .map((v) => v.trim())
    .filter(Boolean);
}

function isNotesRow(row: Record<string, string>): boolean {
  const name = (row.name ?? "").toLowerCase();
  // Skip rows that look like the guidance/notes row from the template
  return (
    name === "" ||
    name.startsWith("required") ||
    name.startsWith("spa name") ||
    name.startsWith("the full") ||
    name.includes("(required)")
  );
}

// ── Row → spa payload ─────────────────────────────────────────────────────────

type SpaRow = Record<string, string>;

function rowToPayload(row: SpaRow) {
  const name = row.name?.trim() ?? "";
  const city = row.city?.trim() ?? "";
  const slug = row.slug?.trim() || slugify(name);
  const status = (row.status?.trim() || "draft") as "draft" | "published" | "archived" | "pending";

  const amenities = row.amenities ? normalizeAmenitySelection(toPipe(row.amenities)) : [];
  const listing_categories = row.listing_categories ? toPipe(row.listing_categories) : [];

  return {
    name,
    slug,
    city,
    state: row.state?.trim() || null,
    postal_code: row.postal_code?.trim() || null,
    country: row.country?.trim() || "USA",
    status,
    address_line_1: row.address_line_1?.trim() || null,
    address_line_2: row.address_line_2?.trim() || null,
    phone: row.phone?.trim() || null,
    email: row.email?.trim() || null,
    website: row.website?.trim() || null,
    summary: row.summary?.trim() || null,
    description: row.description?.trim() || null,
    hours_text: row.hours_text?.trim() || null,
    pricing_text: row.pricing_text?.trim() || null,
    what_to_know: row.what_to_know?.trim() || null,
    important_notes: row.important_notes?.trim() || null,
    day_pass_offered: row.day_pass_offered ? toBool(row.day_pass_offered) : false,
    day_pass_price: row.day_pass_price?.trim() || null,
    listing_categories,
    amenities,
    google_review_url: row.google_review_url?.trim() || null,
    yelp_review_url: row.yelp_review_url?.trim() || null,
    is_featured: row.is_featured ? toBool(row.is_featured) : false,
    business_email: row.business_email?.trim() || null,
    business_phone: row.business_phone?.trim() || null,
    business_website: row.business_website?.trim() || null,
    facebook_url: row.facebook_url?.trim() || null,
    instagram_url: row.instagram_url?.trim() || null,
    tiktok_url: row.tiktok_url?.trim() || null,
    twitter_url: row.twitter_url?.trim() || null,
    youtube_url: row.youtube_url?.trim() || null,
  };
}

// ── Unique slug ───────────────────────────────────────────────────────────────

async function resolveSlug(baseSlug: string, existingId?: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  let slug = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data } = await supabase
      .from("spas")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;                    // slug is free
    if (existingId && data.id === existingId) return slug; // same row, fine
    slug = `${baseSlug}-${suffix++}`;
  }
}

// ── Main import function ──────────────────────────────────────────────────────

export type ImportResult = {
  runId: string | null;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
};

export async function importSpasFromCSV(
  csvText: string,
  filename: string
): Promise<ImportResult> {
  const supabase = createSupabaseAdminClient();
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    return { runId: null, total: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };
  }

  // Row 0 = headers
  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  // Data rows — skip any that look like the template notes row
  const dataRows = rows
    .slice(1)
    .map((values) => {
      const row: SpaRow = {};
      headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
      return row;
    })
    .filter((row) => !isNotesRow(row));

  let inserted = 0;
  const updated = 0;
  let skipped = 0;
  let errors = 0;

  // Create the import run record first (best-effort)
  const run = await createImportRun({
    filename,
    total_rows: dataRows.length,
    inserted_count: 0,
    updated_count: 0,
    skipped_count: 0,
    error_count: 0,
    notes: null,
  });

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNumber = i + 3; // account for header + notes rows

    // Validate required fields
    if (!row.name?.trim()) {
      skipped++;
      continue;
    }
    if (!row.city?.trim()) {
      errors++;
      if (run) {
        await recordImportError(run.id, {
          row_number: rowNumber,
          spa_name: row.name ?? null,
          error_message: "Missing required field: city",
          raw_data: row as Record<string, unknown>,
        });
      }
      continue;
    }

    try {
      const payload = rowToPayload(row);

      // Check if a spa with this slug already exists
      const { data: existing } = await supabase
        .from("spas")
        .select("id, slug")
        .eq("slug", payload.slug)
        .maybeSingle();

      if (existing) {
        // Spa already exists — skip it
        skipped++;
      } else {
        // Resolve slug uniqueness and insert
        const slug = await resolveSlug(payload.slug);
        const { error } = await supabase
          .from("spas")
          .insert({ ...payload, slug });

        if (error) throw new Error(error.message);
        inserted++;
      }
    } catch (err) {
      errors++;
      if (run) {
        await recordImportError(run.id, {
          row_number: rowNumber,
          spa_name: row.name ?? null,
          error_message: err instanceof Error ? err.message : String(err),
          raw_data: row as Record<string, unknown>,
        });
      }
    }
  }

  // Update run totals
  if (run) {
    await supabase
      .from("import_runs")
      .update({ inserted_count: inserted, updated_count: updated, skipped_count: skipped, error_count: errors })
      .eq("id", run.id);
  }

  return { runId: run?.id ?? null, total: dataRows.length, inserted, updated, skipped, errors };
}
