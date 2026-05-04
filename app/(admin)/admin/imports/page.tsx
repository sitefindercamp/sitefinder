import type { Route } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { listImportRuns } from "@/lib/import-runs";

export const metadata = {
  title: "Import History | Admin",
};

type Props = {
  searchParams?: Promise<{ notice?: string }>;
};

export default async function AdminImportsPage({ searchParams }: Props) {
  const runs = await listImportRuns();
  const params = await searchParams;
  const notice = params?.notice ? decodeURIComponent(params.notice) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <PageIntro
          eyebrow="Admin"
          title="Import history"
          description="A log of every data import run."
        />
        <Button asChild>
          <Link href={"/admin/imports/upload" as Route}>
            Upload CSV
          </Link>
        </Button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      {runs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12">
          <p className="text-sm font-medium text-foreground">No imports yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Import history will appear here once you start tracking imports. Use{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
              createImportRun()
            </code>{" "}
            from{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
              lib/import-runs.ts
            </code>{" "}
            at the start of any import script, then call{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
              recordImportError()
            </code>{" "}
            for each failed row.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            You also need to run the migration to create the{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
              import_runs
            </code>{" "}
            and{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
              import_run_errors
            </code>{" "}
            tables in Supabase if you have not done so already.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary/30">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">File</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Inserted</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Skipped</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Errors</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-border last:border-b-0 hover:bg-secondary/20"
                >
                  <td className="px-4 py-3 font-medium">{run.filename}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(run.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{run.total_rows}</td>
                  <td className="px-4 py-3 tabular-nums text-green-700">
                    {run.inserted_count}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-blue-700">
                    {run.updated_count}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {run.skipped_count}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {run.error_count > 0 ? (
                      <span className="font-medium text-red-600">
                        {run.error_count}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/imports/${run.id}` as Route}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
