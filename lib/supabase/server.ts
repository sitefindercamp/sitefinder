import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<CookieStore["set"]>[2];
};

function applyCookies(cookieStore: CookieStore, cookiesToSet: CookieToSet[]) {
  try {
    cookiesToSet.forEach(({ name, value, options }) => {
      cookieStore.set(name, value, options);
    });
  } catch {
    // Server Components cannot always write refreshed auth cookies during render.
    // Middleware/auth routes can handle cookie persistence on the next request.
  }
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        applyCookies(cookieStore, cookiesToSet);
      },
    },
  });
}

export function createSupabaseAdminClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
