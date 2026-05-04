import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-side Google OAuth initiation.
 * Generates the OAuth URL + sets the PKCE verifier cookie in one
 * round-trip, then 302s the browser directly to Google.
 *
 * Using a server route avoids client-side localStorage/cookie race
 * conditions that can cause "OAuth state parameter missing" errors.
 */
export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    const msg = error?.message ?? "Failed to generate Google sign-in URL.";
    return NextResponse.redirect(
      `${origin}/signin?error=${encodeURIComponent(msg)}`
    );
  }

  return NextResponse.redirect(data.url);
}
