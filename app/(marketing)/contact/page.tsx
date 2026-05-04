import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactAction } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the SiteFinder.Camp team. Questions, feedback, campground submissions, or press inquiries are welcome.",
};

type Props = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const params = await searchParams;
  const success = params?.success === "1";
  const error = params?.error ?? null;

  return (
    <Container className="max-w-2xl py-16 pb-24">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Get in touch
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
          Contact us
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Questions, feedback, campground listing requests, or press inquiries — we
          read everything and reply promptly.
        </p>
      </div>

      {/* Contact methods */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-5">
          <div className="rounded-full bg-primary/10 p-2.5">
            <Mail className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Email us directly</p>
            <a
              href="mailto:hello@sitefinder.camp"
              className="mt-1 block text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              hello@sitefinder.camp
            </a>
          </div>
        </div>
        <div className="flex items-start gap-4 rounded-lg border border-border bg-muted/30 p-5">
          <div className="rounded-full bg-primary/10 p-2.5">
            <MessageSquare className="size-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Response time</p>
            <p className="mt-1 text-sm text-muted-foreground">
              We typically reply within one business day.
            </p>
          </div>
        </div>
      </div>

      {/* Success state */}
      {success ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-6 py-8 text-center">
          <p className="text-lg font-semibold text-green-900">
            Message sent!
          </p>
          <p className="mt-2 text-sm text-green-800">
            Thanks for reaching out. We&apos;ve sent a confirmation to your email
            and will be in touch soon.
          </p>
        </div>
      ) : (
        <>
          {/* Error banner */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Form */}
          <form action={submitContactAction} className="space-y-6">
            {/* Honeypot — hidden from real users, bots fill it in */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
              <label htmlFor="hp_url">Leave this blank</label>
              <input
                id="hp_url"
                name="hp_url"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            {/* Render timestamp so the action can reject sub-3s submissions */}
            <input type="hidden" name="_t" value={Date.now().toString()} />

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Smith"
                  required
                  autoComplete="name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="General inquiry, campground submission, feedback..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us what's on your mind…"
                rows={6}
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Send message
              <Mail className="size-4" />
            </Button>
          </form>
        </>
      )}
    </Container>
  );
}
