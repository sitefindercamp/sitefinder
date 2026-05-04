# SiteFinder.Camp

Database website for RV parks, campgrounds, and camping destinations.

Deployed with Vercel from the SiteFinder.Camp GitHub repository.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-compatible component structure
- Supabase-ready helpers for auth and data

## Included routes

- `/`
- `/spas` (temporary legacy route for listings)
- `/spas/[slug]` (temporary legacy route for listing detail)
- `/login`
- `/admin`
- `/admin/spas` (temporary legacy admin route)
- `/admin/spas/new` (temporary legacy admin route)
- `/admin/spas/[id]` (temporary legacy admin route)

## Local setup

1. Install dependencies with your package manager.
2. Copy `.env.example` to `.env.local`.
3. Add your Supabase credentials:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `npm run dev`.

## Notes

- Claim flow is inherited from the source app and still needs campground-specific copy.
- Payments are intentionally not implemented yet.
- The homepage and some admin placeholder screens still use scaffold data from `lib/mock-data.ts`.
- Public listing pages still use the inherited `spas` table and routes until the domain model is migrated.
- Admin authentication uses Supabase session cookies plus middleware refresh.
- Service role usage is server-only and exposed through `createSupabaseAdminClient()`.
