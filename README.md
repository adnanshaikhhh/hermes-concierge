# Hermes Concierge

An AI-powered freelance agency that runs itself 24/7. Pay once, get a real deliverable in minutes. No retainer, no kickoff call, no waiting.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS**
- **shadcn/ui** + **@base-ui/react** primitives
- **Supabase** (Postgres + Auth + RLS) for users, orders, and audit log
- **Stripe** Checkout + Webhooks for real payments
- **MiniMax M3** (MiniMax API) for fulfillment, with a deterministic fallback so the product demos and works even without an API key
- **Resend** for transactional email (delivery notification)
- **Vercel** for hosting, with a 2-minute cron that catches any orders the webhook missed

## Features

- 5 services: Research Brief, Copywriting, Data Analysis, Strategy Report, Competitor Analysis
- Magic-link auth (no password)
- Stripe Checkout with metadata-pinned order IDs
- Server-side price enforcement (client can't tamper with prices)
- Idempotent fulfillment (a webhook + cron race can't double-fulfill)
- One free revision per order
- Full audit trail (`agent_actions` table) for every LLM call, Stripe webhook, and fulfillment
- Per-client RLS at the database level

## Local setup

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in: Supabase URL + keys, Stripe keys, Resend, MiniMax API key

# 3. Set up the database
# In Supabase SQL Editor, run: supabase/migration.sql

# 4. Start Stripe webhook listener (separate terminal)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 5. Run
npm run dev
```

## Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (server only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key (server only) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or Stripe dashboard |
| `MINIMAX_API_KEY` | MiniMax M3 API key (optional — fallback works without) |
| `RESEND_API_KEY` | Resend API key (optional) |
| `FROM_EMAIL` | Verified sender for Resend |
| `NEXT_PUBLIC_APP_URL` | Full URL, e.g. `http://localhost:3000` |
| `CRON_SECRET` | Random 32+ char string for cron auth |

## Architecture

```
Browser → /order/[service] (form)
       → POST /api/checkout          (creates order + Stripe session)
       → Stripe Checkout             (real payment)
       → Stripe webhook              (verifies signature, marks order paid)
       → lib/fulfill.ts              (calls MiniMax M3, stores result, emails client)
       → /order/detail/[id]          (client views delivered work)
       → POST /api/orders/[id]/revision (one free revision)

Cron  */2 * * * *   → /api/cron/process-orders  (catches missed fulfillments)
```

## Security

- All `/dashboard` and `/order/detail/*` routes require a valid Supabase session (enforced in `proxy.ts`)
- Order access is gated by Supabase RLS (`client_id = auth.uid()`)
- Stripe webhook signature is verified on every event
- Cron endpoint requires `Authorization: Bearer $CRON_SECRET`
- Prices are determined server-side from the `services` table — the client request body is validated against an allowlist
- Input validation: brief 50–5000 chars, title 3–200, revision 20–2000
- Rate limit: max 10 orders per client per hour

## Quality standards

- `npx tsc --noEmit` — zero errors
- `npm run build` — production build passes
- All 15 routes return correct status codes
- Designed mobile-first at 375px

## API routes

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/checkout` | Create Stripe Checkout Session + order |
| POST | `/api/webhooks/stripe` | Stripe webhook handler |
| GET  | `/api/cron/process-orders` | Cron-driven fulfillment safety net |
| POST | `/api/orders/[id]/revision` | Submit a revision request |
| POST | `/api/fulfill/[orderId]` | Manual fulfillment trigger (auth required) |
| GET  | `/api/services` | List active services (with DB fallback) |
| POST | `/api/auth/signout` | Sign out |
| GET  | `/auth/callback` | Supabase auth callback |
