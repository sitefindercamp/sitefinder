import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

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

      // Belt-and-suspenders: if the profile role wasn't synced on approval,
      // fall back to checking the spa_owners table directly by email.
      if (role !== "owner" && role !== "admin" && user.email) {
        const { data: spaOwner } = await adminClient
          .from("spa_owners")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();
        if (spaOwner) role = "owner";
      }
    } catch {
      // profiles table not yet available — ignore
    }
  }

  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-background/80 backdrop-blur-xl">
      <Container className="flex h-20 items-center gap-8">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="https://mqkjumltnmkpmkkqdmcn.supabase.co/storage/v1/object/public/Website/logo_site.png"
            alt="KSpa Online"
            width={180}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        <nav className="hidden flex-1 items-center gap-6 md:flex">
          {siteConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
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
                  <Link href={"/owner/dashboard" as Route}>My spa</Link>
                </Button>
              )}
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href={"/account" as Route}>My account</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden md:inline-flex">
                <Link href={"/signin" as Route}>Sign in</Link>
              </Button>
              <Button asChild className="hidden md:inline-flex">
                <Link href={"/signup" as Route}>Sign up</Link>
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
