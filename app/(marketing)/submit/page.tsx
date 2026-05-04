import type { Route } from "next";

import { submitSpaAction } from "@/app/(marketing)/submit/actions";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Submit a Spa | KSpa.online",
  description:
    "Know a Korean spa we're missing? Submit it for review and we'll add it to the directory.",
};

type Props = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function SubmitSpaPage({ searchParams }: Props) {
  const params = await searchParams;
  const success = params?.success === "1";
  const error = params?.error ? decodeURIComponent(params.error) : null;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
          Directory
        </p>
        <h1 className="mt-3 text-4xl font-semibold">Submit a Korean spa</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Know a spa we&apos;re missing? Fill in what you know — our team will
          review it and add it to the directory. Fields marked{" "}
          <span className="text-foreground">*</span> are required.
        </p>

        {success ? (
          <div className="mt-10 rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-green-900">
              Thanks for your submission!
            </p>
            <p className="mt-2 text-sm text-green-800">
              Our team will review it and add it to the directory once approved.
              This usually takes a few days.
            </p>
            <a
              href={"/submit" as Route}
              className="mt-6 inline-block text-sm font-medium text-green-800 underline hover:text-green-900"
            >
              Submit another spa
            </a>
          </div>
        ) : (
          <>
            {error && (
              <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form action={submitSpaAction} className="mt-10 flex flex-col gap-6">
              {/* Basic info */}
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Basic information
                </legend>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">
                    Spa name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="e.g. King Spa & Sauna"
                    required
                    maxLength={200}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="city">
                      City <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="e.g. Dallas"
                      required
                      maxLength={100}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="state">
                      State <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="e.g. TX"
                      required
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="address_line_1">Street address</Label>
                  <Input
                    id="address_line_1"
                    name="address_line_1"
                    type="text"
                    placeholder="e.g. 2154 Royal Ln"
                    maxLength={200}
                  />
                </div>
              </fieldset>

              {/* Contact */}
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Contact &amp; web
                </legend>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      placeholder="https://example.com"
                      maxLength={500}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 555-5555"
                      maxLength={30}
                    />
                  </div>
                </div>
              </fieldset>

              {/* Description */}
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  About this spa
                </legend>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="summary">Brief description</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder="A short description of the spa — what makes it worth visiting, what services it offers, etc."
                    rows={4}
                    maxLength={600}
                  />
                </div>
              </fieldset>

              {/* Submitter contact (optional) */}
              <fieldset className="flex flex-col gap-4">
                <legend className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Your contact (optional)
                </legend>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="submitted_by_email">Your email</Label>
                  <Input
                    id="submitted_by_email"
                    name="submitted_by_email"
                    type="email"
                    placeholder="you@example.com"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only used if we need to follow up. Never shown publicly.
                  </p>
                </div>
              </fieldset>

              <div className="flex justify-end border-t border-border pt-6">
                <Button type="submit" size="lg">
                  Submit for review
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </Container>
  );
}
