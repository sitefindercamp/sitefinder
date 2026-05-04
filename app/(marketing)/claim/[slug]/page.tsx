import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublishedSpaBySlug } from "@/lib/admin-spas";
import { submitClaimAction } from "../actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function ClaimFormContent({
  slug,
  success,
  error,
}: {
  slug: string;
  success: boolean;
  error: string | null;
}) {
  const spa = await getPublishedSpaBySlug(slug);

  if (!spa) {
    redirect("/spas");
  }

  return (
    <Container className="py-16">
      <PageIntro
        eyebrow="Claim Ownership"
        title={`Claim ${spa.name}`}
        description="Submit a request to claim ownership of this spa listing. Our team will review your request and contact you."
      />

      <div className="mt-12 max-w-2xl mx-auto">
        {success && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-green-600 text-2xl">✓</div>
                <div>
                  <h3 className="font-semibold text-green-900">
                    Claim Request Submitted
                  </h3>
                  <p className="text-sm text-green-800 mt-1">
                    Thank you for submitting your claim request. Our team will review it and contact you at the email address provided within 2-3 business days.
                  </p>
                  <p className="text-sm text-green-800 mt-3">
                    Once approved, sign in at{" "}
                    <Link
                      href="/owner/login"
                      className="font-semibold underline"
                    >
                      /owner/login
                    </Link>{" "}
                    using the same email — we&apos;ll send you a one-click sign-in link.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-8 bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="text-red-600 text-2xl">✕</div>
                <div>
                  <h3 className="font-semibold text-red-900">Error</h3>
                  <p className="text-sm text-red-800 mt-1">{decodeURIComponent(error)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!success && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Claim</CardTitle>
              <CardDescription>
                Provide your information and tell us why you should manage this listing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={submitClaimAction.bind(null, slug)} className="space-y-6">
                {/* Spa Info Display */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Claiming:</p>
                  <p className="font-semibold text-lg">{spa.name}</p>
                  {spa.city && spa.state && (
                    <p className="text-sm text-gray-600">
                      {spa.city}, {spa.state}
                    </p>
                  )}
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    name="requester_name"
                    type="text"
                    placeholder="Enter your full name"
                    required
                    className="rounded-2xl"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="requester_email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="rounded-2xl"
                  />
                  <p className="text-xs text-gray-500">
                    We&apos;ll use this to contact you about your claim
                  </p>
                </div>

                {/* Message Field */}
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Information</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us why you should manage this listing... (optional)"
                    rows={4}
                    className="rounded-2xl"
                  />
                  <p className="text-xs text-gray-500">
                    Help us understand your relationship to this spa
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="submit" size="lg" className="rounded-full">
                    Submit Claim Request
                  </Button>
                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    <Link href={`/spas/${slug}`}>Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {success && (
          <div className="text-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full"
            >
              <Link href={`/spas/${slug}`}>Back to Spa Listing</Link>
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}

export const metadata = {
  title: "Claim Spa Listing | KSpa.online",
};

export default async function ClaimPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { success, error } = await searchParams;

  const isSuccess = success === "true";
  const errorMessage = typeof error === "string" ? error : null;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClaimFormContent slug={slug} success={isSuccess} error={errorMessage} />
    </Suspense>
  );
}
