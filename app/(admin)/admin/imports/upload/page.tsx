import type { Route } from "next";
import Link from "next/link";

import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { importSpasAction } from "../actions";

export const metadata = { title: "Import Spas | Admin" };

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function ImportUploadPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <PageIntro
          eyebrow="Admin · Imports"
          title="Import spas from CSV"
          description="Upload a CSV file to bulk-insert or update spa listings."
        />
        <Link
          href={"/admin/imports" as Route}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Import history
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={importSpasAction} className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 flex flex-col gap-5">

          {/* File input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="file" className="text-sm font-medium">
              CSV file <span className="text-red-500">*</span>
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".csv"
              required
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:rounded-xl file:border-0
                file:bg-secondary file:px-4 file:py-2
                file:text-sm file:font-medium file:text-foreground
                hover:file:bg-secondary/80"
            />
            <p className="text-xs text-muted-foreground">Max 5 MB. Must be a .csv file.</p>
          </div>

          {/* Rules */}
          <div className="rounded-xl bg-secondary/40 px-5 py-4 text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">How it works</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Row 1 must be column headers (matches the template exactly).</li>
              <li>The notes/guidance row from the template is automatically skipped.</li>
              <li><strong>name</strong> and <strong>city</strong> are required on every row.</li>
              <li>If <strong>slug</strong> is blank, one is generated from the spa name.</li>
              <li>If a spa with that slug already exists it will be <strong>skipped</strong>, not duplicated.</li>
              <li>Amenities and listing_categories use <strong>pipe separation</strong>: <code className="rounded bg-secondary px-1">Dry Sauna|Hot Tub</code></li>
              <li>Status defaults to <strong>draft</strong> if left blank.</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-4">
          <Button type="submit">Upload &amp; Import</Button>
          <p className="text-sm text-muted-foreground">
            Results are shown immediately after the import completes.
          </p>
        </div>
      </form>
    </div>
  );
}
