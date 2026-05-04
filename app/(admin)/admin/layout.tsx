import type { Route } from "next";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(admin)/admin/actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth-helpers";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin" as Route);
  }

  // Role is the single source of truth — no ADMIN_EMAILS or spa_owners needed here.
  // If the profiles table doesn't exist yet (pre-migration), allow access so
  // the admin isn't locked out before the SQL has been run.
  let role: string | undefined;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role as string | undefined;
  } catch {
    role = "admin"; // fail open pre-migration
  }

  // Fall back to ADMIN_EMAILS if profile isn't set yet (bootstrap path).
  const effectiveIsAdmin = role === "admin" || (!role && isAdminEmail(user.email));

  if (!effectiveIsAdmin) {
    const dest = role === "owner" ? "/owner/dashboard" : "/";
    redirect(dest as Route);
  }

  return (
    <Container className="py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Admin
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
