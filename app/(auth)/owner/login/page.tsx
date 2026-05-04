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

import { requestOwnerMagicLinkAction } from "./actions";

export const metadata = {
  title: "Owner Sign In | KSpa.online",
};

type Props = {
  searchParams?: Promise<{
    error?: string;
    sent?: string;
  }>;
};

export default async function OwnerLoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params?.error ? decodeURIComponent(params.error) : null;
  const sentTo = params?.sent ? decodeURIComponent(params.sent) : null;

  return (
    <Container className="grid min-h-[calc(100svh-10rem)] place-items-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Spa owner sign in</CardTitle>
          <CardDescription>
            Enter the email address tied to your approved spa claim. We&apos;ll
            email you a one-click sign-in link — no password required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentTo ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-900">
                Check your email
              </p>
              <p className="mt-1 text-sm text-green-800">
                We sent a sign-in link to <strong>{sentTo}</strong>. Click the
                link to access your owner dashboard. The link expires in
                one hour.
              </p>
              <p className="mt-3 text-xs text-green-700">
                Didn&apos;t receive it? Check your spam folder, or request a
                new link below.
              </p>
              <form
                action={requestOwnerMagicLinkAction}
                className="mt-4 flex flex-col gap-3"
              >
                <input type="hidden" name="email" value={sentTo} />
                <Button type="submit" variant="outline" size="sm">
                  Send another link
                </Button>
              </form>
            </div>
          ) : (
            <form
              action={requestOwnerMagicLinkAction}
              className="flex flex-col gap-5"
            >
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
              {error ? (
                <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <Button type="submit">Email me a sign-in link</Button>
              <p className="text-xs text-muted-foreground">
                Only emails approved as spa owners will be granted access. If
                your claim is still pending, please wait for admin approval.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
