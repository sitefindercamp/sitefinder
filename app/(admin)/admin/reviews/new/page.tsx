import type { Route } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createAdminReviewAction } from "@/app/(admin)/admin/reviews/actions";
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
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type Props = {
  searchParams?: Promise<{ error?: string }>;
};

async function getPublishedSpas() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("spas")
    .select("id, name, city, state")
    .eq("status", "published")
    .order("name", { ascending: true });

  return (data ?? []) as Array<{
    id: string;
    name: string;
    city: string | null;
    state: string | null;
  }>;
}

export default async function NewAdminReviewPage({ searchParams }: Props) {
  const query = await searchParams;
  const error = query?.error ? decodeURIComponent(query.error) : null;
  const spas = await getPublishedSpas();

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href={"/admin/reviews" as Route}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to reviews
        </Link>
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Add a review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manually enter a review from your old site. It will be attributed to
          the reviewer name you enter and published immediately.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Review details</CardTitle>
          <CardDescription>
            All fields except title are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createAdminReviewAction} className="grid gap-5">
            {/* Spa */}
            <div className="grid gap-2">
              <Label htmlFor="spa_id">Spa</Label>
              <select
                id="spa_id"
                name="spa_id"
                required
                className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Select a spa —</option>
                {spas.map((spa) => {
                  const loc = [spa.city, spa.state].filter(Boolean).join(", ");
                  return (
                    <option key={spa.id} value={spa.id}>
                      {spa.name}{loc ? ` · ${loc}` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Reviewer name */}
            <div className="grid gap-2">
              <Label htmlFor="reviewer_name">Reviewer name</Label>
              <Input
                id="reviewer_name"
                name="reviewer_name"
                required
                placeholder="e.g. Sarah K."
              />
              <p className="text-xs text-muted-foreground">
                This is shown publicly on the listing. Use a first name or
                initials to match your old site&apos;s format.
              </p>
            </div>

            {/* Rating */}
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating</Label>
              <select
                id="rating"
                name="rating"
                required
                defaultValue={5}
                className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} star{n === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title <span className="text-muted-foreground">(optional)</span></Label>
              <Input
                id="title"
                name="title"
                placeholder="A short headline for the review"
              />
            </div>

            {/* Body */}
            <div className="grid gap-2">
              <Label htmlFor="body">Review text</Label>
              <Textarea
                id="body"
                name="body"
                required
                rows={6}
                placeholder="Paste the review text from your old site here."
              />
            </div>

            {/* Date */}
            <div className="grid gap-2">
              <Label htmlFor="reviewed_at">
                Original date <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="reviewed_at"
                name="reviewed_at"
                type="date"
              />
              <p className="text-xs text-muted-foreground">
                Backdate the review to when it was originally written. Leave
                blank to use today&apos;s date.
              </p>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue="approved"
                className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="approved">Approved — visible on listing</option>
                <option value="pending">Pending — needs moderation</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit">Add review</Button>
              <Button variant="outline" asChild>
                <Link href={"/admin/reviews" as Route}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
