import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/(auth)/signup/actions";
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
  title: "Create an account | KSpa.online",
};

type Props = {
  searchParams?: Promise<{
    error?: string;
    verify?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: Props) {
  // Redirect already-logged-in users to their account
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/account" as Route);
  }

  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;
  const showVerify = params?.verify === "true";

  return (
    <Container className="grid min-h-[calc(100svh-10rem)] place-items-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Join KSpa.online to save your favorite spas and leave reviews.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showVerify && (
            <div className="mb-5 flex flex-col gap-5">
              <GoogleAuthButton label="Sign up with Google" />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          )}
          {showVerify ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900">
                Check your email
              </p>
              <p className="mt-1 text-sm text-green-800">
                We sent a confirmation link to your email address. Click the
                link to activate your account — it expires in 24 hours.
              </p>
              <p className="mt-3 text-xs text-green-700">
                Didn&apos;t receive it? Check your spam folder. Once confirmed,
                you can{" "}
                <Link
                  href="/signin"
                  className="font-medium underline underline-offset-2"
                >
                  sign in here
                </Link>
                .
              </p>
            </div>
          ) : (
            <form action={signUpAction} className="flex flex-col gap-5">
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
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Repeat your password"
                  required
                  autoComplete="new-password"
                  minLength={8}
                />
              </div>
              {error ? (
                <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <Button type="submit">Create account</Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
