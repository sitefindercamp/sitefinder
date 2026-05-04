import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  changePasswordAction,
  signOutAction,
  updateProfileAction,
} from "@/app/(marketing)/account/actions";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My Account",
};

type Props = {
  searchParams?: Promise<{ success?: string; error?: string }>;
};

export default async function AccountPage({ searchParams }: Props) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?message=Please+sign+in+to+view+your+account" as Route);
  }

  const params = await searchParams;
  const success = params?.success ?? null;
  const error = params?.error ? decodeURIComponent(params.error) : null;

  // Fetch profile using admin client to bypass RLS reliably
  let role: string | null = null;
  let displayName: string | null = null;

  try {
    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, display_name")
      .eq("id", user.id)
      .single();
    role = (profile?.role as string) ?? null;
    displayName = (profile?.display_name as string) ?? null;

  } catch {
    // profiles table not yet migrated — treat as regular user
  }

  const isAdmin = role === "admin";
  const isOwner = role === "owner";

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">My account</h1>
        <p className="mb-10 text-muted-foreground">
          Manage your SiteFinder.Camp profile.
        </p>

        {/* Success banners */}
        {success === "profile" && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Profile updated successfully.
          </div>
        )}
        {success === "password" && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Password changed successfully.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Profile overview — read-only */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account details.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {displayName && (
                <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{displayName}</span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium capitalize">
                  {isAdmin ? "Admin" : isOwner ? "Campground owner" : "Member"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
                <span className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Edit display name */}
          <Card>
            <CardHeader>
              <CardTitle>Edit profile</CardTitle>
              <CardDescription>Update your display name.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={updateProfileAction} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    type="text"
                    defaultValue={displayName ?? ""}
                    placeholder="Your name"
                    maxLength={80}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is how your name will appear on the site.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Save changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Choose a strong password at least 8 characters long.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={changePasswordAction} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="current_password">Current password</Label>
                  <Input
                    id="current_password"
                    name="current_password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new_password">New password</Label>
                  <Input
                    id="new_password"
                    name="new_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="confirm_password">Confirm new password</Label>
                  <Input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="outline">
                    Update password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Admin quick-access */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Admin dashboard</CardTitle>
                <CardDescription>
                  Manage campground listings, imports, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Dashboard", href: "/admin" },
                    { label: "Listings", href: "/admin/spas" },
                    { label: "Duplicates", href: "/admin/duplicates" },
                    { label: "Imports", href: "/admin/imports" },
                  ].map((link) => (
                    <Button
                      key={link.href}
                      asChild
                      variant="outline"
                      className="justify-start"
                    >
                      <Link href={link.href as Route}>{link.label}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campground owner quick-access */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Your campground</CardTitle>
                <CardDescription>
                  Manage your campground listing and details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href={"/owner/dashboard" as Route}>
                    Go to campground dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Favorites */}
          <Card>
            <CardHeader>
              <CardTitle>Favorites</CardTitle>
              <CardDescription>
                Campgrounds you&apos;ve saved for later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={"/account/favorites" as Route}>View my favorites</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Reviews — regular members only */}
          {!isAdmin && !isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>
                  Write and manage your campground reviews.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline">
                  <Link href={"/campgrounds" as Route}>Find a campground to review</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <form action={signOutAction}>
              <Button type="submit" variant="outline">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Container>
  );
}
