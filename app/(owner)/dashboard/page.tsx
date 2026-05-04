import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSpasByOwnerEmail } from "@/lib/spa-claims";
import { verifyOwnerAuthenticated } from "@/lib/owner-auth";
import { MapPin, Edit2, ExternalLink } from "lucide-react";

async function OwnerDashboardContent() {
  const email = await verifyOwnerAuthenticated();
  const spas = await getSpasByOwnerEmail(email);

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold">Your Spas</h2>
          <p className="text-muted-foreground mt-2">
            You own {spas.length} spa{spas.length !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* Spas List */}
        {spas.length > 0 ? (
          <div className="space-y-4">
            {spas.map((spa) => (
              <Card key={spa.id}>
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    {/* Spa Info */}
                    <div className="min-w-0">
                      <Link
                        href={`/spas/${spa.slug}` as Route}
                        className="group"
                      >
                        <h3 className="text-xl font-semibold group-hover:text-primary">
                          {spa.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="size-4" />
                        {spa.city && spa.state ? (
                          <span>
                            {spa.city}, {spa.state}
                          </span>
                        ) : (
                          <span>Location not specified</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/owner/${spa.id}/edit` as Route}>
                        <Button className="rounded-full" size="sm">
                          <Edit2 className="mr-2 size-4" />
                          Edit
                        </Button>
                      </Link>
                      <Link
                        href={`/spas/${spa.slug}` as Route}
                        target="_blank"
                      >
                        <Button
                          variant="outline"
                          className="rounded-full"
                          size="sm"
                        >
                          <ExternalLink className="mr-2 size-4" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don&apos;t own any spas yet.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/spas">Browse spas to claim one</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}

export const metadata = {
  title: "Owner Dashboard | KSpa.online",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { error, success } = await searchParams;
  const errorMsg = typeof error === "string" ? decodeURIComponent(error) : null;
  const successMsg = typeof success === "string" ? decodeURIComponent(success) : null;

  return (
    <div>
      {errorMsg && (
        <Container className="py-4">
          <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{errorMsg}</p>
          </div>
        </Container>
      )}
      {successMsg && (
        <Container className="py-4">
          <div className="max-w-4xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{successMsg}</p>
          </div>
        </Container>
      )}
      <Suspense fallback={<div>Loading...</div>}>
        <OwnerDashboardContent />
      </Suspense>
    </div>
  );
}
