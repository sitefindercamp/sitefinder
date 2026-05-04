import { createSupabaseAdminClient } from "./supabase/server";

export type ImportRun = {
  id: string;
  filename: string;
  total_rows: number;
  inserted_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  notes: string | null;
  created_at: string;
};

export type ImportRunError = {
  id: string;
  import_run_id: string;
  row_number: number | null;
  spa_name: string | null;
  error_message: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
};

// ── Read ──────────────────────────────────────────────────────

export async function listImportRuns(): Promise<ImportRun[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("import_runs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // Table may not exist yet (migration not yet run)
    console.error("Failed to list import runs:", error.message);
    return [];
  }

  return (data ?? []) as ImportRun[];
}

export async function getImportRun(id: string): Promise<ImportRun | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("import_runs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as ImportRun;
}

export async function getImportRunErrors(
  importRunId: string
): Promise<ImportRunError[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("import_run_errors")
    .select("*")
    .eq("import_run_id", importRunId)
    .order("row_number", { ascending: true });

  if (error || !data) return [];
  return data as ImportRunError[];
}

// ── Write ──────────────────────────────────────────────────────

export async function createImportRun(
  run: Omit<ImportRun, "id" | "created_at">
): Promise<ImportRun | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("import_runs")
    .insert(run)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Failed to create import run:", error?.message);
    return null;
  }

  return data as ImportRun;
}

export async function recordImportError(
  importRunId: string,
  err: Omit<ImportRunError, "id" | "import_run_id" | "created_at">
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("import_run_errors")
    .insert({ ...err, import_run_id: importRunId });
}
