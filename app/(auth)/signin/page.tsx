import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/(auth)/signin/actions";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
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
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in | KSpa.online",
};

type Props = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SignInPage({ searchParams }: Props) {
  // Redirect already-logged-in users
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/account" as Route);
  }

  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;
  const message = params?.message ? decodeURIComponent(params.message) : null;

  return (
    <Container className="grid min-h-[calc(100svh-10rem)] place-items-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Welcome back! Sign in to your KSpa.online account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            <GoogleAuthButton label="Continue with Google" />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>
          </div>
          <form action={signInAction} className="mt-5 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            {error ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {message}
              </p>
            ) : null}
            <Button type="submit">Sign in</Button>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
