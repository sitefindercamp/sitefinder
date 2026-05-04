import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";

import { submitSpaReviewAction } from "@/app/(marketing)/spas/[slug]/review/actions";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MAX_REVIEW_PHOTO_COUNT,
  getUserReviewForSpa,
  userOwnsSpa,
} from "@/lib/spa-reviews";
import {
  createSupabaseAdminClient,
  createSupabaseServerClient,
} from "@/lib/supabase/server";

type ReviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ error?: string }>;
};

async function getReviewSpa(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spas")
    .select("id, slug, name, city, state")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load spa: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: String(data.id),
    slug: String(data.slug ?? slug),
    name: String(data.name ?? "Untitled spa"),
    city: typeof data.city === "string" ? data.city : null,
    state: typeof data.state === "string" ? data.state : null,
  };
}

export default async function SpaReviewPage({
  params,
  searchParams,
}: ReviewPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const spa = await getReviewSpa(slug);

  if (!spa) {
    redirect("/spas" as Route);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?message=Please+sign+in+to+review" as Route);
  }

  const isOwner = await userOwnsSpa(spa.id, user.email);
  const existingReview = await getUserReviewForSpa(spa.id, user.id);
  const existingPhotoCount = existingReview?.photos.length ?? 0;
  const remainingPhotoCount = Math.max(0, MAX_REVIEW_PHOTO_COUNT - existingPhotoCount);
  const location = [spa.city, spa.state].filter(Boolean).join(", ");
  const error = query?.error ? decodeURIComponent(query.error) : null;

  return (
    <Container className="py-16">
      <Link
        href={`/spas/${spa.slug}` as Route}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to listing
      </Link>

      <Card className="mx-auto mt-8 max-w-3xl">
        <CardHeader>
          <CardTitle>{existingReview ? "Edit your review" : "Write a review"}</CardTitle>
          <CardDescription>
            {spa.name}
            {location ? ` · ${location}` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Owners cannot review their own listing.
            </p>
          ) : (
            <form action={submitSpaReviewAction} className="grid gap-6">
              <input type="hidden" name="spa_id" value={spa.id} />
              <input type="hidden" name="slug" value={spa.slug} />

              {error ? (
                <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              {existingReview ? (
                <p className="rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  Editing your review will send it back to pending approval.
                </p>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="rating">Rating</Label>
                <select
                  id="rating"
                  name="rating"
                  required
                  defaultValue={existingReview?.rating ?? 5}
                  className="h-11 rounded-2xl border border-input bg-background px-4 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} star{rating === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Title optional</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={existingReview?.title ?? ""}
                  placeholder="A quick headline for your visit"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="body">Review</Label>
                <Textarea
                  id="body"
                  name="body"
                  required
                  defaultValue={existingReview?.body ?? ""}
                  placeholder="Share what guests should know about your experience."
                  rows={8}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="photos">Photos optional</Label>
                <Input
                  id="photos"
                  name="photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={remainingPhotoCount <= 0}
                />
                <p className="text-xs text-muted-foreground">
                  {remainingPhotoCount > 0
                    ? `${remainingPhotoCount} photo slot${
                        remainingPhotoCount === 1 ? "" : "s"
                      } remaining. JPG, PNG, WebP, or AVIF up to 8 MB each.`
                    : "You already have 3 photos on this review."}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit">
                  <Star className="size-4" />
                  Submit for approval
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/spas/${spa.slug}` as Route}>Cancel</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
