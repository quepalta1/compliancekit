# ComplianceKit

NIS2 & ISO 27001 readiness platform for European SMEs.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database/Auth/Storage**: Supabase
- **Billing**: Stripe
- **Email**: Resend
- **AI**: OpenAI (policy generation)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (local or hosted)
- Stripe account (test mode)
- Resend account
- OpenAI API key

### 1. Clone and install

```bash
git clone <repo-url>
cd ComplianceKit
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`. See `.env.example` for required variables.

### 3. Supabase setup

**Option A: Supabase CLI (local development)**

```bash
npx supabase init   # if not already done
npx supabase start  # starts local Supabase
```

The CLI prints your local `SUPABASE_URL` and keys.

**Option B: Hosted Supabase**

Create a project at [supabase.com](https://supabase.com) and copy your project URL and keys.

### 4. Run migrations and seed data

```bash
# Apply the schema migration
npx supabase db push

# Or run against hosted:
npx supabase db push --db-url "postgresql://postgres:PASSWORD@HOST:5432/postgres"

# Seed data (plans, NIS2 controls, policy templates)
npx supabase db seed
```

The migration creates all tables, RLS policies, storage buckets, and triggers. The seed script populates:
- 4 subscription plans (Free, Starter, Pro, Team)
- 21 NIS2 Article 21(2) controls
- 4 policy templates

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stripe Setup

1. Create products and prices in Stripe Dashboard (test mode) matching the 4 plans.
2. Set up a webhook endpoint pointing to `https://your-domain/api/stripe/webhook` with events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Resend Setup

1. Create an account at [resend.com](https://resend.com).
2. Add and verify your sending domain.
3. Copy the API key to `RESEND_API_KEY`.
4. Set `RESEND_FROM_EMAIL` to your verified sender address.

## OpenAI Setup

1. Get an API key from [platform.openai.com](https://platform.openai.com).
2. Set `OPENAI_API_KEY` in your env.

## Evidence Reminders

A cron job runs daily at 08:00 UTC to send email reminders for evidence items expiring in 90, 60, or 30 days.

- **Vercel**: Configured automatically via `vercel.json`.
- **Manual test**: `GET /api/cron/evidence-reminders?secret=YOUR_CRON_SECRET`

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add all env vars from `.env.example`.
4. Deploy.

## Project Structure

```
src/
  app/
    (marketing)/     # Public pages
    (auth)/          # Login, signup, reset password
    (app)/           # Authenticated app pages
    api/             # Route handlers (Stripe webhook, cron, uploads)
  components/        # React components
  lib/               # Shared utilities, clients, constants
  server/
    actions/         # Server actions
    queries/         # Server-side data fetching
  emails/            # Email templates
supabase/
  migrations/        # SQL migrations
  seed.sql           # Seed data
```

## License

Proprietary. All rights reserved.
