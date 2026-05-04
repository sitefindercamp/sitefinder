import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Building2, CheckCircle2, Mail, MapPin, MessageSquare, UserCheck, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAllClaimRequests } from "@/lib/spa-claims";
import type { ClaimRequestWithSpa } from "@/lib/spa-claims";
import { approveClaimAction, rejectClaimAction, revokeOwnerAction } from "./actions";
import { cn } from "@/lib/utils";

type ClaimStatus = "pending" | "approved" | "rejected";

const STATUS_COLORS: Record<ClaimStatus, string> = {
  pending:  "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100  text-red-800  border-red-200",
};

const FILTERS: Array<{ label: string; value: ClaimStatus | "all" }> = [
  { label: "All",           value: "all" },
  { label: "Pending",       value: "pending" },
  { label: "Active Owners", value: "approved" },
  { label: "Rejected",      value: "rejected" },
];

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function ClaimRow({ claim }: { claim: ClaimRequestWithSpa }) {
  const status = claim.status as ClaimStatus;

  return (
    <div className="flex flex-wrap items-start gap-4 px-4 py-4">
      {/* Spa info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
            {claim.spa_name ?? "Unknown Spa"}
          </span>
          {claim.spa_city && claim.spa_state && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3 shrink-0" />
              {claim.spa_city}, {claim.spa_state}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserCheck className="size-3 shrink-0" />
            {claim.requester_name}
          </span>
          <a
            href={`mailto:${claim.requester_email}`}
            className="inline-flex items-center gap-1 hover:text-primary"
          >
            <Mail className="size-3 shrink-0" />
            {claim.requester_email}
          </a>
        </div>

        {claim.message && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <MessageSquare className="mt-px size-3 shrink-0" />
            <span className="line-clamp-2 italic">&ldquo;{claim.message}&rdquo;</span>
          </p>
        )}
      </div>

      {/* Date + badge + actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{formatDate(claim.created_at)}</span>

        <Badge variant="outline" className={STATUS_COLORS[status]}>
          {status === "approved" ? "Active Owner" : status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>

        {status === "pending" && (
          <>
            <form action={approveClaimAction}>
              <input type="hidden" name="claim_id" value={claim.id} />
              <input type="hidden" name="spa_id" value={claim.spa_id} />
              <input type="hidden" name="owner_email" value={claim.requester_email} />
              <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                <CheckCircle2 className="size-3.5 text-green-600" />
                Approve
              </Button>
            </form>
            <form action={rejectClaimAction}>
              <input type="hidden" name="claim_id" value={claim.id} />
              <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                <XCircle className="size-3.5 text-red-600" />
                Reject
              </Button>
            </form>
          </>
        )}

        {status === "approved" && (
          <form action={revokeOwnerAction}>
            <input type="hidden" name="spa_id" value={claim.spa_id} />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="size-3.5" />
              Revoke
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

async function ClaimsListContent({
  filter,
  success,
  error,
}: {
  filter: ClaimStatus | undefined;
  success: string | null;
  error: string | null;
}) {
  const allClaims = await listAllClaimRequests();

  const counts = {
    pending:  allClaims.filter((c) => c.status === "pending").length,
    approved: allClaims.filter((c) => c.status === "approved").length,
    rejected: allClaims.filter((c) => c.status === "rejected").length,
  };

  const visible = filter ? allClaims.filter((c) => c.status === filter) : allClaims;
  const total = allClaims.length;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Management</p>
        <h1 className="mt-2 text-3xl font-semibold">Spa Claims</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {total} claim request{total !== 1 ? "s" : ""} · {counts.pending} pending review.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const href =
            f.value === "all"
              ? ("/admin/claims" as Route)
              : (`/admin/claims?status=${f.value}` as Route);
          const active = f.value === "all" ? !filter : f.value === filter;
          const count = f.value !== "all" ? counts[f.value as ClaimStatus] : null;

          return (
            <Link
              key={f.value}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {f.label}
              {count != null && count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : f.value === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-secondary text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Alerts */}
      {success && (
        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {decodeURIComponent(success)}
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}

      {/* Claims list */}
      {visible.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          {visible.map((claim, i) => (
            <div
              key={claim.id}
              className={i !== visible.length - 1 ? "border-b border-border" : ""}
            >
              <ClaimRow claim={claim} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No {filter ? `${filter} ` : ""}claims found.
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: "Spa Claims | Admin",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ClaimsPage({ searchParams }: Props) {
  const params = await searchParams;

  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const filter =
    statusParam === "pending" || statusParam === "approved" || statusParam === "rejected"
      ? (statusParam as ClaimStatus)
      : undefined;

  const success = typeof params.success === "string" ? params.success : null;
  const error   = typeof params.error   === "string" ? params.error   : null;

  return (
    <Suspense fallback={<div>Loading…</div>}>
      <ClaimsListContent filter={filter} success={success} error={error} />
    </Suspense>
  );
}
