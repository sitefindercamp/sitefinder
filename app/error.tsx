"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to console so it shows up in Vercel runtime logs
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center">
      <Container className="max-w-2xl py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          Something went wrong
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          We hit a snag
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          A temporary error occurred — this is usually a brief hiccup.
          Try again and it should clear right up.
        </p>

        {/* Error digest for support reference (production only shows the digest, not the raw message) */}
        {error.digest && (
          <p className="mt-4 font-mono text-xs text-muted-foreground/60">
            Error ref: {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" onClick={reset}>
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Go home</Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/spas" className="hover:text-foreground">
            Browse spas
          </Link>
          <Link href="/guides" className="hover:text-foreground">
            Guides
          </Link>
          <Link href="/contact" className="hover:text-foreground">
            Contact us
          </Link>
        </div>
      </Container>
    </div>
  );
}
