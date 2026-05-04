import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageIntro } from "@/components/layout/page-intro";
import { getImportRun, getImportRunErrors } from "@/lib/import-runs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const run = await getImportRun(id);
  return { title: run ? `Import: ${run.filename}` : "Import Details" };
}

export default async function AdminImportDetailPage({ params }: Props) {
  const { id } = await params;

  const [run, errors] = await Promise.all([
    getImportRun(id),
    getImportRunErrors(id),
  ]);

  if (!run) {
    notFound();
  }

  const successCount = run.inserted_count + run.updated_count;
  const successRate =
    run.total_rows > 0
      ? Math.round((successCount / run.total_rows) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          eyebrow="Import"
          title={run.filename}
          description={`Imported on ${new Date(run.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}`}
        />
        <Link
          href={"/admin/imports" as Route}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← All imports
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryCard label="Total rows" value={run.total_rows} />
        <SummaryCard label="Inserted" value={run.inserted_count} accent="green" />
        <SummaryCard label="Updated" value={run.updated_count} accent="blue" />
        <SummaryCard label="Skipped" value={run.skipped_count} />
        <SummaryCard
          label="Errors"
          value={run.error_count}
          accent={run.error_count > 0 ? "red" : undefined}
        />
      </div>

      {/* Success rate */}
      <div className="rounded-2xl border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Success rate:{" "}
          <span className="font-semibold text-foreground">{successRate}%</span>
          {" "}({successCount} of {run.total_rows} rows processed without error)
        </p>
        {run.notes && (
          <p className="mt-2 text-sm text-muted-foreground">
            Notes: {run.notes}
          </p>
        )}
      </div>

      {/* Error table */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Row errors ({errors.length})
        </h2>

        {errors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-6 py-8 text-center text-sm text-muted-foreground">
            No errors recorded for this import.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary/30">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Row</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Spa name</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Error</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Raw data</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr
                    key={err.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">
                      {err.row_number ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {err.spa_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {err.error_message ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {err.raw_data ? (
                        <details className="cursor-pointer">
                          <summary className="text-xs text-muted-foreground hover:text-foreground">
                            View
                          </summary>
                          <pre className="mt-2 max-w-xs overflow-auto rounded bg-secondary p-2 text-xs">
                            {JSON.stringify(err.raw_data, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "blue" | "red";
}) {
  const valueClass =
    accent === "green"
      ? "text-green-700"
      : accent === "blue"
        ? "text-blue-700"
        : accent === "red"
          ? "text-red-600"
          : "text-foreground";

  return (
    <div className="rounded-2xl border border-border p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-semibold tabular-nums ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}
