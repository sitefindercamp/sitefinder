import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";
import { isAdminEmail } from "@/lib/auth-helpers";

type MiddlewareCookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: MiddlewareCookieToSet[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isOwnerRoute = pathname.startsWith("/owner") && pathname !== "/owner/login";
  const isAdminLogin = pathname === "/login";
  const isOwnerLogin = pathname === "/owner/login";

  // ── Unauthenticated guards ───────────────────────────────────
  if (!user) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
    if (isOwnerRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/owner/login";
      return NextResponse.redirect(url);
    }
    return response;
  }

  // ── Authenticated: fetch role from profiles ──────────────────
  let role: string | undefined;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role as string | undefined;
  } catch {
    // profiles table not yet created — will be set by loginAction
  }

  // Fall back to ADMIN_EMAILS if profile role isn't set yet (bootstrap path).
  // Once loginAction runs, it writes 'admin' to profiles and this is no
  // longer needed.
  const isAdmin = role === "admin" || (!role && isAdminEmail(user.email));
  const isOwner = role === "owner";

  // Owners are always blocked from /admin — hard rule.
  if (isAdminRoute && isOwner) {
    const url = request.nextUrl.clone();
    url.pathname = "/owner/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Only redirect away from login pages when role is already established.
  // Users with role='user' or no profile yet can still reach /login to
  // trigger the loginAction bootstrap (which upgrades them to admin/owner).
  if (isAdminLogin && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isOwnerLogin && isOwner) {
    const url = request.nextUrl.clone();
    url.pathname = "/owner/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
