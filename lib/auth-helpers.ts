/**
 * Returns true if the given email should be granted admin access.
 *
 * Behaviour:
 *  - If ADMIN_EMAILS is not set (or empty), ALL authenticated users are
 *    treated as admins — this preserves the original behaviour and avoids
 *    locking everyone out before the env var is configured.
 *  - Once ADMIN_EMAILS is set (comma-separated), only listed addresses
 *    pass; everyone else is routed to /owner/dashboard.
 *
 * NOTE: This function is intentionally free of any `next/headers` imports
 * so it can be safely used in middleware (Edge Runtime).
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  // Not configured yet — fail open so existing admins aren't locked out.
  if (allowed.length === 0) return true;
  return allowed.includes(email.toLowerCase());
}

/**
 * Resolve the site's absolute base URL from request headers, falling back to
 * the NEXT_PUBLIC_SITE_URL env var. Used for building magic-link redirect URLs.
 *
 * Uses `next/headers` — only safe in Server Components, Server Actions, and
 * Route Handlers. Do NOT import this in middleware.
 */
export async function getSiteOrigin(): Promise<string> {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  // Dynamic import keeps `next/headers` out of the module's static import graph,
  // which would otherwise break Edge Runtime (middleware) consumers of this file.
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}
