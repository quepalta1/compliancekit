# ComplianceKit — Project Guide

## Quick Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests (vitest)
npm run test:watch   # Tests in watch mode
npm run lint         # ESLint
```

## Product Vision

ComplianceKit is a supplier assurance platform with two compliance layers:

1. **Framework Readiness** — NIS2 and ISO 27001 compliance assessments, AI-generated policies, evidence management, and remediation tracking. This is the original core and remains fully functional.

2. **Buyer-Defined Supplier Requirements** — Buyers define custom requirements (security, sustainability, labor standards, etc.), connect supplier organizations, and monitor their compliance responses. Suppliers see incoming requirements and submit attestations with evidence summaries.

Both layers share the same multi-tenant organization model and can be used independently or together.

## Architecture

Single Next.js 15 App Router monolith. Multi-tenant shared Postgres database via Supabase. Every tenant-owned row has `organization_id`. Tenant isolation via Postgres RLS.

## Key Conventions

- **Server data access**: Use `createClient()` from `@/lib/supabase/server` (respects RLS). Use `createServiceClient()` from `@/lib/supabase/service` only for webhooks/cron.
- **Auth pattern**: `supabase.auth.getUser()` in server components/actions. Middleware handles session refresh.
- **Org context**: `getCurrentOrganization()` from `@/server/queries/organization` returns `{ user, profile, organization }` or null.
- **Server actions**: In `src/server/actions/`. Return `{ error: string } | null` pattern (network actions use `{ error } | { success } | null`). Use `useActionState` on the client.
- **Validation**: Zod schemas in `src/lib/validation.ts`. Constants/enums in `src/lib/constants.ts`.
- **Business logic**: Deterministic code in `src/lib/compliance/` and `src/lib/network/`. AI only for policy generation (`src/lib/llm/`).
- **Lazy clients**: Resend, OpenAI, Stripe all use lazy initialization (getter functions) to avoid build-time errors from missing env vars.

## Database

- Migration: `supabase/migrations/20260324230000_init_compliancekit.sql`
- Seed: `supabase/seed.sql`
- Do not create parallel schema files. Modify the existing migration for schema changes.
- The `profiles` table primary key is `user_id` (not `id`).
- `evidence_items.expires_at` is a `date` column, not `timestamptz`.

### Supplier Network Tables

- `supplier_relationships` — links a customer org to a supplier org (unique pair, self-reference blocked)
- `buyer_requirements` — requirements defined by a buyer org (category, type, optional framework ref)
- `supplier_requirement_responses` — supplier's response to a specific requirement (status, text, evidence summary; unique per relationship+requirement)

RLS ensures buyers see their own requirements/relationships, suppliers see requirements from connected buyers, and responses are visible to both sides of the relationship.

## File Structure

```
src/app/(app)/       # Authenticated pages (protected by middleware + layout)
  dashboard/         # Combined framework + network overview
  assessment/        # NIS2 framework assessment
  evidence/          # Evidence vault
  policies/          # AI policy generation
  reports/           # Compliance reports
  requirements/      # Buyer requirements management
  suppliers/         # Connected suppliers (buyer view)
  customers/         # Buyer relationships (supplier view)
  onboarding/        # NIS2 applicability wizard
  settings/          # Billing, team
src/app/(auth)/      # Login, signup, reset-password
src/app/(marketing)/ # Pricing (public)
src/app/api/         # Route handlers (cron, stripe webhook, uploads, downloads)
src/components/      # React components by feature
  network/           # Supplier network forms (requirement, connect, response)
src/lib/             # Shared utilities, clients, business logic
  network/           # Supplier compliance summary logic + tests
src/server/actions/  # Server actions ("use server")
  network.ts         # Buyer requirement, supplier connection, response submission
src/server/queries/  # Server-side query helpers
  network.ts         # Buyer network, supplier network, requirements queries
```

## Testing

Tests live next to their source files (e.g., `scoring.test.ts` next to `scoring.ts`). Run with `npm test`. Focus tests on deterministic business logic (classification, scoring, validation, network summary).
