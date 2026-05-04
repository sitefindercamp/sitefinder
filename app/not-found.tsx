import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page Not Found | KSpa Online",
};

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center">
      <Container className="max-w-2xl py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          404
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          We couldn&apos;t find the page you were looking for. It may have
          moved, been removed, or the link might be wrong.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href={"/spas" as Route}>Browse spas</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={"/" as Route}>Go home</Link>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href={"/guides" as Route} className="hover:text-foreground">
            Guides
          </Link>
          <Link href={"/blog" as Route} className="hover:text-foreground">
            Blog
          </Link>
          <Link href={"/contact" as Route} className="hover:text-foreground">
            Contact us
          </Link>
        </div>
      </Container>
    </div>
  );
}
