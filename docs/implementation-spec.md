# ComplianceKit MVP Implementation Spec

## Product Goal
ComplianceKit is a multi-tenant B2B SaaS web app that helps European SMEs assess and improve readiness for NIS2 and ISO 27001. The MVP focuses on self-service onboarding, NIS2 gap assessment, AI-generated policies, evidence tracking, a compliance dashboard, and subscription billing.

The build goal is first paying customers in 6 weeks. Prioritize simplicity, speed, and reliability over architectural purity.

## Core Product Scope
1. Onboarding wizard
   - 5-question flow
   - Determines NIS2 applicability and likely entity class
   - Stores raw answers and derived result
2. Gap assessment
   - Covers all 21 NIS2 Article 21(2) controls
   - One question at a time
   - Answers: `yes`, `partial`, `no`
   - Produces control-level RAG and prioritized remediation actions
3. AI policy generator
   - User selects policy type
   - User provides company context
   - App generates structured policy content via OpenAI
   - App renders downloadable DOCX and PDF files
4. Evidence tracker
   - Evidence records mapped to one or more controls
   - File upload support for PDFs and images
   - Expiry dates and reminder notifications
5. Compliance dashboard
   - Overall score
   - Per-control RAG overview
   - Open actions
   - Exportable PDF report
6. Auth and billing
   - Email/password auth
   - Organization-based multi-tenancy
   - Stripe subscription plans: Free, Starter, Pro, Team

## Stack
- Frontend/app server: Next.js App Router, TypeScript
- UI: Tailwind CSS, shadcn/ui, React Hook Form, Zod
- Database/Auth/Storage: Supabase
- Billing: Stripe Checkout + Billing Portal
- Email: Resend
- AI: OpenAI Responses API with structured JSON output
- DOCX generation: `docx`
- PDF generation: `@react-pdf/renderer`
- Hosting: Vercel

## Non-Negotiable Architecture Decisions
- Single Next.js monolith
- Single shared Postgres database
- Multi-tenancy enforced with `organization_id` plus Postgres RLS
- No microservices
- No Redis, no queue system in MVP
- Use server actions or route handlers, whichever is simpler per flow
- AI used only for policy drafting and remediation wording
- Compliance scoring and classification remain deterministic code

## Data Model

### Identity and tenancy
- `profiles`
  - `user_id uuid primary key references auth.users(id)`
  - `full_name text`
  - `last_organization_id uuid null`
  - `created_at timestamptz default now()`

- `organizations`
  - `id uuid primary key default gen_random_uuid()`
  - `name text not null`
  - `slug text unique not null`
  - `country_code text`
  - `sector text`
  - `employee_band text`
  - `nis2_applicable boolean`
  - `entity_class text check (entity_class in ('essential','important','out_of_scope','unknown')) default 'unknown'`
  - `onboarding_completed_at timestamptz null`
  - `created_at timestamptz default now()`

- `organization_members`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `user_id uuid references auth.users(id) on delete cascade`
  - `role text check (role in ('owner','admin','member')) not null`
  - `joined_at timestamptz default now()`
  - primary key (`organization_id`, `user_id`)

- `organization_invites`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `email text not null`
  - `role text check (role in ('admin','member')) not null`
  - `token_hash text not null`
  - `expires_at timestamptz not null`
  - `accepted_at timestamptz null`
  - `created_at timestamptz default now()`

### Billing
- `plans`
  - `id uuid primary key default gen_random_uuid()`
  - `code text unique not null`
  - `name text not null`
  - `price_eur integer not null`
  - `max_members integer`
  - `features_json jsonb not null default '{}'::jsonb`

- `subscriptions`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid unique references organizations(id) on delete cascade`
  - `plan_id uuid references plans(id)`
  - `stripe_customer_id text unique`
  - `stripe_subscription_id text unique`
  - `status text not null`
  - `current_period_start timestamptz null`
  - `current_period_end timestamptz null`
  - `cancel_at_period_end boolean default false`
  - `created_at timestamptz default now()`
  - `updated_at timestamptz default now()`

### Onboarding and assessment
- `onboarding_responses`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `answers_json jsonb not null`
  - `derived_result_json jsonb not null`
  - `completed_by uuid references auth.users(id)`
  - `completed_at timestamptz default now()`

- `control_catalog`
  - `id uuid primary key default gen_random_uuid()`
  - `framework text not null default 'nis2'`
  - `control_code text unique not null`
  - `article_ref text not null`
  - `title text not null`
  - `description text not null`
  - `guidance text not null`
  - `weight numeric(5,2) not null default 1.0`
  - `sort_order integer not null`
  - `iso27001_refs text[] default '{}'::text[]`

- `assessments`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `status text check (status in ('draft','completed')) not null default 'draft'`
  - `score_pct numeric(5,2) default 0`
  - `started_by uuid references auth.users(id)`
  - `started_at timestamptz default now()`
  - `completed_at timestamptz null`

- `assessment_answers`
  - `id uuid primary key default gen_random_uuid()`
  - `assessment_id uuid references assessments(id) on delete cascade`
  - `control_id uuid references control_catalog(id)`
  - `answer text check (answer in ('yes','partial','no')) not null`
  - `note text`
  - `answered_by uuid references auth.users(id)`
  - `answered_at timestamptz default now()`
  - unique (`assessment_id`, `control_id`)

- `assessment_control_statuses`
  - `id uuid primary key default gen_random_uuid()`
  - `assessment_id uuid references assessments(id) on delete cascade`
  - `control_id uuid references control_catalog(id)`
  - `score numeric(5,2) not null`
  - `rag text check (rag in ('red','amber','green')) not null`
  - `priority_rank integer not null`
  - `remediation_summary text not null`
  - unique (`assessment_id`, `control_id`)

- `remediation_actions`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `assessment_id uuid references assessments(id) on delete cascade`
  - `control_id uuid references control_catalog(id)`
  - `title text not null`
  - `description text not null`
  - `priority text check (priority in ('high','medium','low')) not null`
  - `status text check (status in ('open','in_progress','done')) not null default 'open'`
  - `owner_user_id uuid null references auth.users(id)`
  - `due_date date null`
  - `created_at timestamptz default now()`

### Evidence
- `evidence_items`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `title text not null`
  - `description text`
  - `owner_user_id uuid null references auth.users(id)`
  - `status text check (status in ('valid','expiring','expired')) not null default 'valid'`
  - `expires_at date null`
  - `last_reviewed_at date null`
  - `created_at timestamptz default now()`

- `evidence_item_controls`
  - `evidence_item_id uuid references evidence_items(id) on delete cascade`
  - `control_id uuid references control_catalog(id)`
  - primary key (`evidence_item_id`, `control_id`)

- `evidence_files`
  - `id uuid primary key default gen_random_uuid()`
  - `evidence_item_id uuid references evidence_items(id) on delete cascade`
  - `storage_path text not null`
  - `file_name text not null`
  - `mime_type text not null`
  - `byte_size bigint not null`
  - `checksum_sha256 text null`
  - `uploaded_by uuid references auth.users(id)`
  - `uploaded_at timestamptz default now()`

### Notifications
- `email_notifications`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `evidence_item_id uuid references evidence_items(id) on delete cascade`
  - `template_code text not null`
  - `reminder_day integer not null`
  - `recipient_email text not null`
  - `provider_message_id text null`
  - `sent_at timestamptz default now()`
  - unique (`evidence_item_id`, `template_code`, `reminder_day`, `recipient_email`)

### Policies
- `policy_templates`
  - `id uuid primary key default gen_random_uuid()`
  - `code text unique not null`
  - `name text not null`
  - `description text not null`
  - `default_sections_json jsonb not null`
  - `prompt_version text not null`
  - `is_active boolean default true`

- `policy_documents`
  - `id uuid primary key default gen_random_uuid()`
  - `organization_id uuid references organizations(id) on delete cascade`
  - `template_id uuid references policy_templates(id)`
  - `requested_by uuid references auth.users(id)`
  - `status text check (status in ('queued','generating','completed','failed')) not null default 'queued'`
  - `model text not null`
  - `input_context_json jsonb not null`
  - `input_hash text not null`
  - `structured_content_json jsonb null`
  - `docx_path text null`
  - `pdf_path text null`
  - `error_message text null`
  - `created_at timestamptz default now()`
  - `completed_at timestamptz null`
  - unique (`organization_id`, `template_id`, `input_hash`)

## RLS Rules
- All tenant-owned tables must enforce access through membership in `organization_members`
- Static catalog tables such as `control_catalog` and `policy_templates` can be readable by authenticated users
- Service role is allowed only in:
  - Stripe webhook processing
  - Scheduled reminder route
  - Admin-only seed/bootstrap tasks if needed

## Deterministic Business Logic

### Onboarding classification
- Implement a rules engine in code, not in prompts
- Input: 5 onboarding answers
- Output:
  - `nis2_applicable`
  - `entity_class`
  - short textual explanation

### Assessment scoring
- `yes = 1`
- `partial = 0.5`
- `no = 0`
- `score_pct = (sum weighted answers / sum weights) * 100`
- RAG thresholds:
  - `green >= 0.8`
  - `amber >= 0.4 and < 0.8`
  - `red < 0.4`
- Generate remediation actions deterministically from `red` and `amber` controls

## Policy Generation Design
- User chooses a policy template and enters company context
- App sends:
  - policy type
  - organization profile
  - optional custom notes
  - required output schema
- OpenAI returns strict JSON
- App stores JSON in `policy_documents.structured_content_json`
- App renders:
  - DOCX via `docx`
  - PDF via `@react-pdf/renderer`
- Cache key:
  - hash of `organization_id + template_id + normalized input JSON + prompt_version`
- If a completed matching record exists, return it instead of regenerating

## Storage Design
- Supabase private bucket for evidence
- Supabase private bucket for generated documents
- Evidence path pattern:
  - `org/{organizationId}/evidence/{evidenceItemId}/{fileName}`
- Policy path pattern:
  - `org/{organizationId}/policies/{policyDocumentId}/policy.docx`
  - `org/{organizationId}/policies/{policyDocumentId}/policy.pdf`
- Use signed upload or signed download URLs
- Do not proxy file binaries through Next.js unless necessary for export generation

## Route Map

### Public
- `/`
- `/pricing`
- `/login`
- `/signup`
- `/reset-password`

### Authenticated app
- `/app/dashboard`
- `/app/onboarding`
- `/app/assessment`
- `/app/assessment/[assessmentId]`
- `/app/evidence`
- `/app/evidence/[evidenceId]`
- `/app/policies`
- `/app/policies/new`
- `/app/reports/[assessmentId]`
- `/app/settings/billing`
- `/app/settings/team`

### Route handlers / API
- `/api/stripe/webhook`
- `/api/uploads/evidence`
- `/api/reports/dashboard-pdf`
- `/api/cron/evidence-reminders`

## Suggested Folder Structure
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

## Week-by-Week Delivery Plan

### Week 1
- Initialize Next.js app and developer tooling
- Set up Supabase project, migrations, seed data, auth, storage buckets
- Implement all core database tables and RLS
- Implement user signup/login/logout
- Implement organization creation and membership model
- Implement reminder data model and daily reminder route skeleton now
- Wire Resend and create reminder email templates now
- Seed plans, controls, and policy templates
- Deliver a working authenticated app shell

### Week 2
- Build onboarding wizard
- Implement deterministic NIS2 applicability logic
- Build assessment flow with one-question-at-a-time UX
- Implement scoring, RAG, and remediation action generation
- Persist assessments and answers

### Week 3
- Build dashboard
- Build evidence tracker CRUD
- Implement control-to-evidence mapping
- Implement direct file uploads to storage
- Implement expiry date UX and evidence status calculation
- Finish reminder job logic and idempotent email sending

### Week 4
- Build AI policy generation flow
- Implement OpenAI structured output integration
- Render DOCX and PDF
- Implement policy history and document download
- Build exportable PDF report
- This is the first demo-ready MVP

### Week 5
- Integrate Stripe Checkout, subscription syncing, and billing portal
- Add plan gating if needed
- Build team invites
- Add production error monitoring and operational polish
- Improve copy and UX rough edges

### Week 6
- Full QA pass
- Verify RLS and tenant isolation manually and with tests
- Verify webhooks, cron, and reminder emails in production
- Add privacy policy, terms, and essential support flows
- Prepare launch for first paying customers

## MVP Definition At End Of Week 4
- User can sign up and create an organization
- User can complete onboarding and get an applicability result
- User can complete a 21-control assessment and receive dashboard + remediation output
- User can track evidence, upload files, and assign expiry dates
- Reminder infrastructure exists and is testable
- User can generate at least a few policy types into DOCX and PDF
- User can export a PDF compliance report

## Production-Ready For First 10 Customers
Must have:
- HTTPS, custom domain, production env vars
- Stripe live mode configured
- RLS on all tenant tables
- Storage buckets private
- Signed URLs for access
- Email domain verified
- Logs visible
- Basic smoke tests
- Legal pages published

Can skip:
- SSO
- OCR
- Malware scanning
- Background workers beyond scheduled route
- Full audit trail UI
- Advanced analytics
- Per-customer branding

## Definition Of Done
- App builds cleanly
- Migrations run from scratch
- Seed data loads successfully
- Core flows work in local and preview environments
- No tenant can read or write another tenant's data
- Uploads, reminders, Stripe webhooks, and policy generation are all testable end-to-end
