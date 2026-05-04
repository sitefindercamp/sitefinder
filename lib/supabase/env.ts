const PUBLIC_SUPABASE_URL_FALLBACK = "https://crlgwufflhyknmtsrdct.supabase.co";
const PUBLIC_SUPABASE_ANON_KEY_FALLBACK =
  "sb_publishable_thKtQwW2v4UrgdWHAKD6TQ_f2f6CRFw";

function getRequiredEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? PUBLIC_SUPABASE_URL_FALLBACK).replace(/\/rest\/v1\/?$/, "");
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PUBLIC_SUPABASE_ANON_KEY_FALLBACK;
}

export function getSupabaseServiceRoleKey() {
  return getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}
