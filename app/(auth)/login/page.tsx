import type { Route } from "next";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/(auth)/login/actions";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminEmail } from "@/lib/auth-helpers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Login",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect((isAdminEmail(user.email) ? "/admin" : "/owner/dashboard") as Route);
  }

  const params = await searchParams;
  const error = params?.error;
  const redirectTo = params?.redirectTo ?? "/admin";

  return (
    <Container className="grid min-h-[calc(100svh-10rem)] place-items-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Login</CardTitle>
          <CardDescription>
            Sign in to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={loginAction} className="flex flex-col gap-5">
            <input name="redirectTo" type="hidden" value={redirectTo} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@kspa.online"
                required
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
              />
            </div>
            {error ? (
              <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
