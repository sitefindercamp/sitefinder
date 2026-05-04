import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ownerSignOutAction } from "./actions";

async function OwnerLayoutContent({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/owner/login" as Route);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "owner") {
    // Admins who end up here should go to /admin; everyone else goes home.
    const dest = profile?.role === "admin" ? "/admin" : "/owner/login";
    redirect(dest as Route);
  }

  return (
    <div>
      <div className="border-b bg-gray-50">
        <Container className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as {user.email}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/">Back to site</Link>
              </Button>
              <form action={ownerSignOutAction}>
                <Button type="submit" variant="ghost" className="rounded-full">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>
      {children}
    </div>
  );
}

export const metadata = {
  title: "Owner Dashboard | KSpa.online",
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerLayoutContent>{children}</OwnerLayoutContent>;
}
