import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createSupabaseClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}

