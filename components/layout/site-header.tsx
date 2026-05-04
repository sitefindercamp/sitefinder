import type { Route } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine role using admin client to bypass RLS reliably
  let role: string | undefined;
  if (user) {
    try {
      const adminClient = createSupabaseAdminClient();
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      role = profile?.role as string | undefined;

    } catch {
      // profiles table not yet available — ignore
    }
  }

  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071916]/95 text-white backdrop-blur-xl">
      <Container className="flex h-[72px] items-center gap-8 py-4">
        <Link href="/" className="flex shrink-0 items-center text-2xl font-bold tracking-tight text-white">
          SiteFinder.Camp
        </Link>

        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 pb-1 text-sm font-semibold hover:text-white ${
                item.href === "/" ? "border-[#e5d960] text-white" : "border-transparent text-white/72"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {/* Desktop account buttons */}
          {user ? (
            <>
              {isAdmin && (
                <Button asChild variant="ghost" className="hidden md:inline-flex">
                  <Link href={"/admin" as Route}>Admin dashboard</Link>
                </Button>
              )}
              {isOwner && (
                <Button asChild variant="ghost" className="hidden md:inline-flex">
                  <Link href={"/owner/dashboard" as Route}>My campground</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href={"/account" as Route}>My account</Link>
              </Button>
              <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white md:inline-flex">
                <Link href={"/account/favorites" as Route}>
                  <Heart className="size-4" />
                  Favorites
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden text-white hover:bg-white/10 hover:text-white md:inline-flex">
                <Link href={"/account/favorites" as Route}>
                  <Heart className="size-4" />
                  Favorites
                </Link>
              </Button>
              <Button asChild className="hidden bg-[#4b8b6b] text-white hover:bg-[#5e9b7a] md:inline-flex">
                <Link href={"/campgrounds" as Route}>Browse Campgrounds</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger */}
          <MobileNav
            isLoggedIn={!!user}
            isAdmin={isAdmin}
            isOwner={isOwner}
          />
        </div>
      </Container>
    </header>
  );
}
