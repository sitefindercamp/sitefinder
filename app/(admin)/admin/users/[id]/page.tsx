import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Building2, Calendar, Mail, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfileById } from "@/lib/profiles";
import {
  listReviewsByUserId,
  countReviewsByUserId,
} from "@/lib/spa-reviews";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) return { title: "User Not Found | Admin" };
  return { title: `${profile.email} | Admin Users` };
}

const STATUS_COLORS = {
  pending:  "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100  text-red-800  border-red-200",
  hidden:   "bg-gray-100 text-gray-700  border-gray-200",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-0.5 text-primary">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={s <= rating ? "size-3 fill-current" : "size-3 text-muted-foreground/30"}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border px-5 py-4">
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;

  // Fetch profile + display name + review data in parallel
  const [profile, reviewCounts, reviews] = await Promise.all([
    getProfileById(id),
    countReviewsByUserId(id),
    listReviewsByUserId(id),
  ]);

  if (!profile) notFound();

  // Fetch display_name separately (getProfileById doesn't include it yet)
  const adminClient = createSupabaseAdminClient();
  const { data: profileRow } = await adminClient
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .single();

  const displayName = (profileRow as { display_name?: string | null } | null)?.display_name;
  const username = displayName || profile.email.split("@")[0];
  const totalReviews = Object.values(reviewCounts).reduce((a, b) => a + b, 0);
  const recentReviews = reviews.slice(0, 5);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="grid gap-6">
      {/* Back link */}
      <Link
        href={"/admin/users" as Route}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All users
      </Link>

      {/* Profile header */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-xl font-semibold text-muted-foreground">
          {username[0]?.toUpperCase() ?? "?"}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{username}</h1>
            <Badge variant="outline" className="capitalize">{profile.role}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {profile.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Joined {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Review stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
          Review Activity
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Reviews" value={totalReviews} />
          <StatCard label="Pending" value={reviewCounts.pending} sub="awaiting moderation" />
          <StatCard label="Approved" value={reviewCounts.approved} sub="live on site" />
          <StatCard label="Rejected" value={reviewCounts.rejected + reviewCounts.hidden} sub="rejected or hidden" />
        </div>
      </div>

      {/* Recent reviews */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
            Recent Reviews
          </h2>
          {totalReviews > 5 && (
            <Link
              href={`/admin/reviews?user_id=${id}` as Route}
              className="text-xs font-medium text-primary hover:underline"
            >
              View all {totalReviews} →
            </Link>
          )}
        </div>

        {recentReviews.length > 0 ? (
          <div className="grid gap-3">
            {recentReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/admin/spas/${review.spa_id}` as Route}
                      className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary"
                    >
                      <Building2 className="size-3.5 text-muted-foreground" />
                      {review.spa_name ?? "Unknown spa"}
                    </Link>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <Badge
                        variant="outline"
                        className={STATUS_COLORS[review.status]}
                      >
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                  {review.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  {review.title && (
                    <p className="mb-1 text-sm font-semibold">{review.title}</p>
                  )}
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {review.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border px-4 py-10 text-center text-sm text-muted-foreground">
            This user hasn&apos;t submitted any reviews yet.
          </div>
        )}
      </div>
    </div>
  );
}
