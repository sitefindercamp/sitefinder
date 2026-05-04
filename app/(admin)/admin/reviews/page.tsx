/* eslint-disable @next/next/no-img-element */
import type { Route } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, EyeOff, Star, XCircle, PlusCircle, User, Building2 } from "lucide-react";

import { moderateReviewAction } from "@/app/(admin)/admin/reviews/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type ReviewStatus, listAdminReviews, countReviewsByStatus } from "@/lib/spa-reviews";
import { cn } from "@/lib/utils";

type AdminReviewsPageProps = {
  searchParams?: Promise<{
    status?: string;
    error?: string;
    success?: string;
  }>;
};

const FILTERS: Array<{ label: string; value: ReviewStatus | "all" }> = [
  { label: "Pending",  value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Hidden",   value: "hidden" },
  { label: "All",      value: "all" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 text-primary">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={star <= rating ? "size-3.5 fill-current" : "size-3.5 text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

function ModerationButton({
  reviewId,
  status,
  children,
}: {
  reviewId: string;
  status: ReviewStatus;
  children: ReactNode;
}) {
  return (
    <form action={moderateReviewAction}>
      <input type="hidden" name="review_id" value={reviewId} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" variant="outline" size="sm">
        {children}
      </Button>
    </form>
  );
}

const STATUS_BADGE: Record<ReviewStatus, string> = {
  pending:  "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  hidden:   "bg-gray-100 text-gray-700 border-gray-200",
};

export default async function AdminReviewsPage({ searchParams }: AdminReviewsPageProps) {
  const query = await searchParams;
  const requestedStatus = query?.status;
  const status =
    requestedStatus === "pending" ||
    requestedStatus === "approved" ||
    requestedStatus === "rejected" ||
    requestedStatus === "hidden"
      ? requestedStatus
      : undefined;

  const [reviews, counts] = await Promise.all([
    listAdminReviews(status),
    countReviewsByStatus(),
  ]);

  const error   = query?.error   ? decodeURIComponent(query.error)   : null;
  const success = query?.success ? decodeURIComponent(query.success) : null;

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Moderation</p>
          <h1 className="mt-2 text-3xl font-semibold">Reviews</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Approve, reject, or hide user-submitted spa reviews.
          </p>
        </div>
        <Button asChild>
          <Link href={"/admin/reviews/new" as Route}>
            <PlusCircle className="size-4" />
            Add review
          </Link>
        </Button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href =
            filter.value === "all"
              ? ("/admin/reviews" as Route)
              : (`/admin/reviews?status=${filter.value}` as Route);
          const active = filter.value === "all" ? !status : filter.value === status;
          const count  = filter.value !== "all" ? counts[filter.value] : null;

          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground",
                active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {filter.label}
              {count != null && count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : filter.value === "pending"
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
      {error && (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </p>
      )}

      {/* Review cards */}
      <div className="grid gap-3">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                {/* Top row: reviewer → spa · date · status */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {/* Username → user detail */}
                    {review.user_id ? (
                      <Link
                        href={`/admin/users/${review.user_id}` as Route}
                        className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary"
                      >
                        <User className="size-3.5 text-muted-foreground" />
                        {review.user_display_name}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <User className="size-3.5 text-muted-foreground" />
                        {review.user_display_name}
                      </span>
                    )}

                    <span className="text-muted-foreground/50">·</span>

                    {/* Spa name → spa edit page */}
                    <Link
                      href={`/admin/spas/${review.spa_id}` as Route}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
                    >
                      <Building2 className="size-3.5" />
                      {review.spa_name ?? "Unknown spa"}
                    </Link>

                    {review.created_at && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <span className="text-muted-foreground">
                          {new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(review.created_at))}
                        </span>
                      </>
                    )}
                  </div>

                  <Badge variant="outline" className={STATUS_BADGE[review.status]}>
                    {review.status}
                  </Badge>
                </div>

                {/* Star rating */}
                <div className="mt-1">
                  <StarRating rating={review.rating} />
                </div>
              </CardHeader>

              <CardContent className="grid gap-4 pt-0">
                {/* Review content */}
                <div>
                  {review.title && (
                    <p className="mb-1 text-sm font-semibold">{review.title}</p>
                  )}
                  <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {review.body}
                  </p>
                </div>

                {/* Photos */}
                {review.photos.length > 0 && (
                  <div className="grid gap-2 sm:grid-cols-4">
                    {review.photos.map((photo) => (
                      <a
                        key={photo.id}
                        href={photo.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-xl border border-border"
                      >
                        <img
                          src={photo.image_url}
                          alt="Review photo"
                          className="h-24 w-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <ModerationButton reviewId={review.id} status="approved">
                    <CheckCircle2 className="size-4 text-green-600" />
                    Approve
                  </ModerationButton>
                  <ModerationButton reviewId={review.id} status="rejected">
                    <XCircle className="size-4 text-red-600" />
                    Reject
                  </ModerationButton>
                  <ModerationButton reviewId={review.id} status="hidden">
                    <EyeOff className="size-4" />
                    Hide
                  </ModerationButton>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No reviews found.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
