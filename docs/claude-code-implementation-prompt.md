# Claude Code Implementation Prompt

You are implementing a greenfield MVP for a B2B SaaS web app called ComplianceKit.

## Product
ComplianceKit helps European SMEs assess and improve readiness for NIS2 and ISO 27001. It replaces manual consulting-heavy compliance workflows with a self-service web app.

## Goal
Build the MVP for first paying customers in 6 weeks. Optimize for speed, simplicity, and reliability. Do not over-engineer.

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Supabase for Postgres, Auth, Storage
- Stripe for subscriptions
- Resend for email
- OpenAI Responses API for policy generation
- `docx` for Word document generation
- `@react-pdf/renderer` for PDF generation
- Deploy target: Vercel

## Architecture Constraints
- Single monolithic Next.js app
- Multi-tenant shared database
- Every tenant-owned row must include `organization_id`
- Tenant isolation must be enforced with Postgres RLS
- Use deterministic code for onboarding classification and compliance scoring
- Use AI only for policy drafting and optionally remediation wording
- No microservices
- No Redis
- No queue system for MVP
- Prefer server actions and route handlers over adding extra backend frameworks

## MVP Scope
1. Email/password auth
2. Organization creation and membership
3. Onboarding wizard with 5 questions and deterministic NIS2 applicability result
4. Gap assessment covering all 21 NIS2 Article 21(2) controls
5. Control-level RAG and prioritized remediation actions
6. Evidence tracker with file uploads and expiry dates
7. Email reminder system for evidence expiry at 90, 60, and 30 days
8. AI policy generator producing DOCX and PDF output
9. Compliance dashboard
10. Stripe billing: Free, Starter, Pro, Team

## Source Of Truth
Use `docs/implementation-spec.md` as the authoritative product and architecture document.

## What I Want You To Do
Implement the system in phases, but keep the codebase continuously runnable.

### Phase 1: Foundation
1. Initialize the Next.js app with TypeScript and Tailwind.
2. Set up a maintainable folder structure aligned with the spec.
3. Add Supabase client/server helpers.
4. Create SQL migrations for all required tables in the spec.
5. Seed:
   - subscription plans
   - the 21 NIS2 controls
   - initial policy templates
6. Configure RLS for every tenant-owned table.
7. Set up signup/login/logout.
8. Implement organization creation after signup.
9. Create a base authenticated app shell with sidebar/top nav.
10. Set up Resend scaffolding and the evidence reminder route skeleton in this first phase.

### Phase 2: Onboarding And Assessment
1. Build the onboarding wizard UI.
2. Implement deterministic classification logic in code.
3. Store onboarding answers and derived result.
4. Build the assessment flow with one control/question at a time.
5. Implement scoring:
   - `yes = 1`
   - `partial = 0.5`
   - `no = 0`
6. Implement RAG thresholds:
   - green >= 0.8
   - amber >= 0.4 and < 0.8
   - red < 0.4
7. Generate remediation actions from red and amber controls.

### Phase 3: Evidence And Dashboard
1. Build the dashboard page.
2. Build evidence item CRUD.
3. Implement control-to-evidence mapping.
4. Implement direct upload to Supabase Storage using signed upload flow if practical.
5. Store metadata in `evidence_files`.
6. Implement expiry date handling and evidence status calculation.
7. Complete the reminder job logic and idempotent notification persistence via `email_notifications`.

### Phase 4: Policy Generation
1. Build the policies list and create flow.
2. Implement OpenAI integration with structured output.
3. The model must return structured JSON, not free-form final documents.
4. Hash normalized input to support cache reuse.
5. If the same template and input hash already exist and are completed, return cached results.
6. Render DOCX and PDF from stored structured JSON.
7. Store generated files in private storage.
8. Implement download UX.

### Phase 5: Billing
1. Integrate Stripe Checkout for plan upgrades.
2. Add Stripe Billing Portal access.
3. Implement Stripe webhook syncing into `subscriptions`.
4. Reflect subscription state in the app.
5. Add minimal plan gating only where necessary.

### Phase 6: Hardening
1. Add smoke tests or simple integration tests for critical flows.
2. Verify tenant isolation.
3. Verify reminder job idempotency.
4. Verify document generation and file access rules.
5. Clean up rough UX edges.

## Requirements For Your Implementation
- Favor straightforward code over abstraction-heavy patterns.
- Avoid introducing Prisma or Drizzle unless there is a strong reason; direct SQL migrations plus Supabase access is preferred.
- Keep helper modules small and obvious.
- Use Zod for input validation.
- Keep all prompt text and policy schemas versioned in code.
- Use stable enums/constant unions for statuses and answer values.
- Add concise comments only where logic would otherwise be non-obvious.
- Make the app runnable from a fresh clone with clear setup instructions.

## Deliverables
1. Working codebase
2. SQL migrations
3. Seed script/data
4. `.env.example`
5. README with setup, Supabase setup, Stripe setup, Resend setup, OpenAI setup, and deployment notes

## Suggested Initial Folder Structure
```text
src/
  app/
    (marketing)/
    (auth)/
    (app)/
      dashboard/
      onboarding/
      assessment/
      evidence/
      policies/
      reports/
      settings/
    api/
      stripe/webhook/
      uploads/evidence/
      reports/dashboard-pdf/
      cron/evidence-reminders/
  components/
    ui/
    dashboard/
    onboarding/
    assessment/
    evidence/
    policies/
  lib/
    supabase/
    auth/
    billing/
    email/
    llm/
    documents/
    compliance/
    validation/
    utils/
  server/
    actions/
    queries/
  emails/
  content/
supabase/
  migrations/
  seed.sql
```

## Specific Technical Notes

### Multi-tenancy
- Shared DB, shared schema
- Every tenant-owned table has `organization_id`
- All application reads/writes must be scoped to the current organization
- Membership in `organization_members` is the authorization root

### File Storage
- Evidence files path:
  - `org/{organizationId}/evidence/{evidenceItemId}/{fileName}`
- Policy docs path:
  - `org/{organizationId}/policies/{policyDocumentId}/policy.docx`
  - `org/{organizationId}/policies/{policyDocumentId}/policy.pdf`
- Buckets should be private
- Use signed URLs for access

### Reminder Emails
- Send at 90, 60, and 30 days before `expires_at`
- Use a scheduled route handler
- Prevent duplicates by checking `email_notifications`
- Template can be simple for MVP

### OpenAI Policy Generation
- Send policy type, company context, and required schema
- Return strict structured JSON
- Save JSON in `policy_documents.structured_content_json`
- Render the final documents from that JSON
- Keep prompt versioning explicit in code

### Dashboard
Must show:
- overall score percentage
- per-control RAG
- open remediation actions
- recent evidence items
- export PDF action

## Working Style
- Start by scaffolding the app and schema.
- Keep commits or logical chunks small and reviewable.
- If you hit uncertainty, prefer the simplest implementation that satisfies the spec.
- Do not redesign the product.
- Do not expand scope beyond the MVP.

## Acceptance Criteria
- A new user can sign up, create an organization, and log in
- The user can complete onboarding and see a classification result
- The user can complete the 21-control assessment and see score, RAG, and remediation output
- The user can add evidence, upload files, set expiry dates, and view status
- Reminder infrastructure exists and can be tested manually
- The user can generate a policy document and download DOCX and PDF
- The user can access a billing page and upgrade via Stripe
- All tenant data is isolated correctly

Implement this now. Start with project scaffolding, schema, RLS, auth, seed data, and the authenticated app shell.
