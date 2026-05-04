import type { Route } from "next";
import Link from "next/link";

import { ignoreDuplicateGroupAction, mergeDuplicatesAction } from "@/app/(admin)/admin/duplicates/actions";
import { PageIntro } from "@/components/layout/page-intro";
import { listAdminSpas } from "@/lib/admin-spas";
import { detectDuplicates } from "@/lib/duplicate-detection";
import { getIgnoredPairSet } from "@/lib/ignored-duplicates";

export const metadata = {
  title: "Duplicate Detection | Admin",
};

type Props = {
  searchParams?: Promise<{ merged?: string; ignored?: string; error?: string }>;
};

export default async function AdminDuplicatesPage({ searchParams }: Props) {
  const params = await searchParams;
  const mergedCount = params?.merged ? parseInt(params.merged, 10) : null;
  const ignoredSuccess = params?.ignored === "1";
  const error = params?.error ? decodeURIComponent(params.error) : null;

  const [spas, ignoredPairs] = await Promise.all([
    listAdminSpas(),
    getIgnoredPairSet(),
  ]);
  const groups = detectDuplicates(spas, ignoredPairs);

  const totalFlagged = groups.reduce((acc, g) => acc + g.spas.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <PageIntro
        eyebrow="Admin"
        title="Duplicate detection"
        description="Listings that share a name, phone number, website domain, or address. Select the one to keep — the others will be permanently deleted."
      />

      {/* Success / error banners */}
      {mergedCount !== null && mergedCount > 0 && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {mergedCount} duplicate listing{mergedCount !== 1 ? "s" : ""} permanently deleted.
        </div>
      )}
      {ignoredSuccess && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Group ignored — it won&apos;t appear in future duplicate checks.
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No duplicates found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All {spas.length} listing{spas.length !== 1 ? "s" : ""} appear
            unique across name, phone, website, and address.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {totalFlagged} listing{totalFlagged !== 1 ? "s" : ""} across{" "}
            {groups.length} group{groups.length !== 1 ? "s" : ""} may be
            duplicates. Select which listing to keep — the others will be permanently deleted.
          </p>

          <div className="flex flex-col gap-6">
            {groups.map((group, idx) => {
              const groupIdsCsv = group.spas.map((s) => s.id).join(",");
              // Unique IDs let us associate inputs/buttons with forms via the
              // HTML `form` attribute — no nested <form> elements needed.
              const mergeFormId = `merge-group-${idx}`;
              const ignoreFormId = `ignore-group-${idx}`;

              return (
                <div key={idx} className="overflow-hidden rounded-2xl border border-border">
                  {/* Hidden forms — display:none, no layout impact */}
                  <form id={mergeFormId} action={mergeDuplicatesAction} className="hidden">
                    <input type="hidden" name="group_ids" value={groupIdsCsv} />
                  </form>
                  <form id={ignoreFormId} action={ignoreDuplicateGroupAction} className="hidden">
                    <input type="hidden" name="group_ids" value={groupIdsCsv} />
                  </form>

                  {/* Group header */}
                  <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3 text-sm">
                    <span className="font-semibold">{group.spas.length} listings</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-muted-foreground">
                      Flagged for:{" "}
                      <span className="font-medium text-foreground">
                        {group.reasons.join(", ")}
                      </span>
                    </span>
                  </div>

                  {/* Spa rows */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="border-b border-border">
                        <tr>
                          <th className="px-4 py-2 font-medium text-muted-foreground">Keep</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">Name</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">City</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">State</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">Website</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">Phone</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">Address</th>
                          <th className="px-4 py-2 font-medium text-muted-foreground">Status</th>
                          <th className="px-4 py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.spas.map((spa, spaIdx) => (
                          <tr
                            key={spa.id}
                            className="border-b border-border last:border-b-0 hover:bg-secondary/20"
                          >
                            <td className="px-4 py-3">
                              {/* form attribute associates this radio with the merge form */}
                              <input
                                type="radio"
                                form={mergeFormId}
                                name="keep_id"
                                value={spa.id}
                                defaultChecked={spaIdx === 0}
                                className="accent-primary"
                                aria-label={`Keep ${spa.name}`}
                              />
                            </td>
                            <td className="px-4 py-3 font-medium">
                              <a
                                href={`/spas/${spa.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline"
                              >
                                {spa.name}
                              </a>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{spa.city}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {spa.state ?? <Empty />}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {spa.website ?? spa.business_website ?? <Empty />}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {spa.phone ?? spa.business_phone ?? <Empty />}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {spa.address_line_1 ?? <Empty />}
                            </td>
                            <td className="px-4 py-3">
                              <StatusPill status={spa.status} />
                            </td>
                            <td className="px-4 py-3">
                              <Link
                                href={`/admin/spas/${spa.id}` as Route}
                                className="text-sm font-medium text-primary hover:underline"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer — both actions live here, inside the card */}
                  <div className="border-t border-border bg-secondary/20 px-4 py-3">
                    {/* Merge row */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          form={mergeFormId}
                          name="confirm"
                          value="yes"
                          required
                          className="accent-primary"
                        />
                        I understand the unselected listings will be permanently
                        deleted along with their images
                      </label>
                      <button
                        type="submit"
                        form={mergeFormId}
                        className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90"
                      >
                        Keep selected — delete others
                      </button>
                    </div>

                    {/* Ignore row */}
                    <div className="mt-2 flex justify-end border-t border-border/40 pt-2">
                      <button
                        type="submit"
                        form={ignoreFormId}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Not duplicates — ignore this group
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Empty() {
  return <span className="italic text-muted-foreground/50">Empty</span>;
}

function StatusPill({ status }: { status: string }) {
  const styles =
    status === "published"
      ? "bg-green-100 text-green-800"
      : status === "draft"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
