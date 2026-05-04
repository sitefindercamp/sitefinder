import Link from "next/link";

import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 py-8">
      <Container className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Kspa.online.</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/spas">Search</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/guides">Guides</Link>
          <Link href="/advertise">Advertise</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </Container>
    </footer>
  );
}

