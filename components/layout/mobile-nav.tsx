"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

type MobileNavProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isOwner: boolean;
};

export function MobileNav({ isLoggedIn, isAdmin, isOwner }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Only render portal after client mount (portals need the DOM)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overlay = open ? (
    <div className="fixed inset-x-0 top-20 bottom-0 z-[60] flex flex-col overflow-y-auto border-t border-border bg-background">
      <nav className="flex flex-col gap-1 px-6 py-6">
        {siteConfig.mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mx-6 border-t border-border" />

      <div className="flex flex-col gap-2 px-6 py-6">
        {isLoggedIn ? (
          <>
            {isAdmin && (
              <Button asChild variant="ghost" className="justify-start rounded-xl">
                <Link href={"/admin" as Route} onClick={() => setOpen(false)}>
                  Admin dashboard
                </Link>
              </Button>
            )}
            {isOwner && (
              <Button asChild variant="ghost" className="justify-start rounded-xl">
                <Link href={"/owner/dashboard" as Route} onClick={() => setOpen(false)}>
                  My spa
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost" className="justify-start rounded-xl">
              <Link href={"/account" as Route} onClick={() => setOpen(false)}>
                My account
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="justify-start rounded-xl">
              <Link href={"/signin" as Route} onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href={"/signup" as Route} onClick={() => setOpen(false)}>
                Sign up
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="md:hidden">
      {/* Hamburger / close button */}
      <Button
        variant="ghost"
        size="sm"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="w-9 px-0"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/*
        Render the overlay via a portal directly on document.body.
        This escapes the sticky header's stacking context (created by
        backdrop-blur), which can block touch events on iOS Safari.
      */}
      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
