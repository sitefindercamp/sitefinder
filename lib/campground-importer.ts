import { createImportRun, recordImportError } from "@/lib/import-runs";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

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
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\r" && next === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i++;
    } else if (char === "\n" || char === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  if (row.length > 0 || cell.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  while (rows.length > 0 && rows[rows.length - 1].every((value) => value.trim() === "")) {
    rows.pop();
  }

  return rows;
}

const REQUIRED_HEADERS = [
  "name",
  "address",
  "city",
  "state",
  "zip",
  "phone",
  "email",
  "website",
  "price_range",
  "campground_type",
  "full_hookups",
  "amp_30",
  "amp_50",
  "pull_through",
  "big_rig_friendly",
  "wifi",
  "laundry",
  "showers",
  "pool",
  "pet_friendly",
  "monthly_stays",
  "dump_station",
  "description",
] as const;

type CampgroundRow = Record<(typeof REQUIRED_HEADERS)[number], string>;

type ImportResult = {
  runId: string | null;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

function toOptionalBool(value: string | undefined): boolean | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  if (!normalized) return null;
  if (["true", "yes", "y", "1"].includes(normalized)) return true;
  if (["false", "no", "n", "0"].includes(normalized)) return false;
  return null;
}

function normalizeHeaders(headers: string[]) {
  return headers.map((header) => header.trim().toLowerCase().replace(/\s+/g, "_"));
}

function getMissingHeaders(headers: string[]) {
  const headerSet = new Set(headers);
  return REQUIRED_HEADERS.filter((header) => !headerSet.has(header));
}

function isEmptyRow(row: Record<string, string>) {
  return Object.values(row).every((value) => value.trim() === "");
}

function rowToPayload(row: CampgroundRow, filename: string, rowNumber: number) {
  const name = row.name.trim();
  const city = row.city.trim();
  const state = row.state.trim().toUpperCase();
  const slug = slugify([name, city, state].filter(Boolean).join(" "));

  return {
    slug,
    status: "published",
    name,
    address: clean(row.address),
    city,
    state,
    zip: clean(row.zip),
    phone: clean(row.phone),
    email: clean(row.email),
    website: clean(row.website),
    price_range: clean(row.price_range),
    campground_type: clean(row.campground_type),
    full_hookups: toOptionalBool(row.full_hookups),
    amp_30: toOptionalBool(row.amp_30),
    amp_50: toOptionalBool(row.amp_50),
    pull_through: toOptionalBool(row.pull_through),
    big_rig_friendly: toOptionalBool(row.big_rig_friendly),
    wifi: toOptionalBool(row.wifi),
    laundry: toOptionalBool(row.laundry),
    showers: toOptionalBool(row.showers),
    pool: toOptionalBool(row.pool),
    pet_friendly: toOptionalBool(row.pet_friendly),
    monthly_stays: toOptionalBool(row.monthly_stays),
    dump_station: toOptionalBool(row.dump_station),
    description: clean(row.description),
    source_filename: filename,
    source_row_number: rowNumber,
  };
}

async function resolveSlug(baseSlug: string): Promise<string> {
  const supabase = createSupabaseAdminClient();
  let slug = baseSlug;
  let suffix = 2;

  for (;;) {
    const { data } = await supabase
      .from("campgrounds")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) return slug;
    slug = `${baseSlug}-${suffix++}`;
  }
}

export async function importCampgroundsFromCSV(
  csvText: string,
  filename: string
): Promise<ImportResult> {
  const supabase = createSupabaseAdminClient();
  const rows = parseCSV(csvText);

  if (rows.length < 2) {
    return { runId: null, total: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };
  }

  const headers = normalizeHeaders(rows[0]);
  const missingHeaders = getMissingHeaders(headers);

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV columns: ${missingHeaders.join(", ")}`);
  }

  const dataRows = rows
    .slice(1)
    .map((values) => {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] ?? "";
      });
      return row as CampgroundRow;
    })
    .filter((row) => !isEmptyRow(row));

  let inserted = 0;
  const updated = 0;
  let skipped = 0;
  let errors = 0;

  const run = await createImportRun({
    filename,
    total_rows: dataRows.length,
    inserted_count: 0,
    updated_count: 0,
    skipped_count: 0,
    error_count: 0,
    notes: null,
  });

  for (let index = 0; index < dataRows.length; index++) {
    const row = dataRows[index];
    const rowNumber = index + 2;

    if (!row.name.trim()) {
      skipped++;
      continue;
    }

    if (!row.city.trim() || !row.state.trim()) {
      errors++;
      if (run) {
        await recordImportError(run.id, {
          row_number: rowNumber,
          campground_name: clean(row.name),
          error_message: "Missing required field: city or state",
          raw_data: row,
        });
      }
      continue;
    }

    try {
      const payload = rowToPayload(row, filename, rowNumber);
      const slug = await resolveSlug(payload.slug);
      const { error } = await supabase.from("campgrounds").insert({ ...payload, slug });

      if (error) throw new Error(error.message);
      inserted++;
    } catch (error) {
      errors++;
      if (run) {
        await recordImportError(run.id, {
          row_number: rowNumber,
          campground_name: clean(row.name),
          error_message: error instanceof Error ? error.message : String(error),
          raw_data: row,
        });
      }
    }
  }

  if (run) {
    await supabase
      .from("import_runs")
      .update({
        inserted_count: inserted,
        updated_count: updated,
        skipped_count: skipped,
        error_count: errors,
      })
      .eq("id", run.id);
  }

  return { runId: run?.id ?? null, total: dataRows.length, inserted, updated, skipped, errors };
}
