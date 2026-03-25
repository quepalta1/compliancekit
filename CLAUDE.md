# ComplianceKit — Project Guide

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests (vitest)
npm run test:watch   # Tests in watch mode
npm run lint         # ESLint
```

## Architecture

Single Next.js 15 App Router monolith. Multi-tenant shared Postgres database via Supabase. Every tenant-owned row has `organization_id`. Tenant isolation via Postgres RLS.

## Key Conventions

- **Server data access**: Use `createClient()` from `@/lib/supabase/server` (respects RLS). Use `createServiceClient()` from `@/lib/supabase/service` only for webhooks/cron.
- **Auth pattern**: `supabase.auth.getUser()` in server components/actions. Middleware handles session refresh.
- **Org context**: `getCurrentOrganization()` from `@/server/queries/organization` returns `{ user, profile, organization }` or null.
- **Server actions**: In `src/server/actions/`. Return `{ error: string } | null` pattern. Use `useActionState` on the client.
- **Validation**: Zod schemas in `src/lib/validation.ts`. Constants/enums in `src/lib/constants.ts`.
- **Business logic**: Deterministic code in `src/lib/compliance/`. AI only for policy generation (`src/lib/llm/`).
- **Lazy clients**: Resend, OpenAI, Stripe all use lazy initialization (getter functions) to avoid build-time errors from missing env vars.

## Database

- Migration: `supabase/migrations/20260324230000_init_compliancekit.sql`
- Seed: `supabase/seed.sql`
- Do not create parallel schema files. Modify the existing migration for schema changes.
- The `profiles` table primary key is `user_id` (not `id`).
- `evidence_items.expires_at` is a `date` column, not `timestamptz`.

## File Structure

```
src/app/(app)/       # Authenticated pages (protected by middleware + layout)
src/app/(auth)/      # Login, signup, reset-password
src/app/api/         # Route handlers (cron, stripe webhook, uploads, downloads)
src/components/      # React components by feature
src/lib/             # Shared utilities, clients, business logic
src/server/actions/  # Server actions ("use server")
src/server/queries/  # Server-side query helpers
```

## Testing

Tests live next to their source files (e.g., `scoring.test.ts` next to `scoring.ts`). Run with `npm test`. Focus tests on deterministic business logic (classification, scoring, validation).
