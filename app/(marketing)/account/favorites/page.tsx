import type { Route } from "next";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Heart, MapPin } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import { getUserFavoritedSpas } from "@/lib/spa-favorites";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Favorites",
};

export default async function FavoritesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/signin?message=${encodeURIComponent("Please sign in to view your favorites")}` as Route
    );
  }

  const spas = await getUserFavoritedSpas(user.id);

  return (
    <Container className="py-16">
      <Link
        href={"/account" as Route}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to account
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight">My favorites</h1>
        <p className="mt-2 text-muted-foreground">
          Spas you&apos;ve saved for later.
        </p>
      </div>

      {spas.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-16 text-center">
          <Heart className="size-10 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">
            No favorites yet
          </p>
          <p className="max-w-xs text-sm text-muted-foreground/70">
            Hit the <strong>Save</strong> button on any spa listing to bookmark
            it here.
          </p>
          <Link
            href={"/spas" as Route}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Browse spas
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {spas.map((spa) => {
            const location = [spa.city, spa.state].filter(Boolean).join(", ");
            return (
              <Link
                key={spa.id}
                href={`/spas/${spa.slug}` as Route}
                className="group block"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div>
                      <h2 className="text-base font-semibold leading-snug group-hover:text-primary">
                        {spa.name}
                      </h2>
                      {location ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" />
                          {location}
                        </p>
                      ) : null}
                    </div>
                    {spa.summary ? (
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {spa.summary}
                      </p>
                    ) : null}
                    <p className="mt-auto text-xs text-muted-foreground/60">
                      Saved{" "}
                      {spa.favorited_at
                        ? new Intl.DateTimeFormat("en", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(spa.favorited_at))
                        : "recently"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
