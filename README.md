# ⚡ Hermes Concierge

> The AI agency that never sleeps.

**[Live demo →](https://hermes-concierge-ten.vercel.app)**
Built for **Hermes × NVIDIA × Stripe Hackathon** · Powered by **MiniMax M3** on **NVIDIA NIM**

---

## What is this?

Hermes Concierge is a fully autonomous AI freelance agency. Clients submit a brief, pay via Stripe, and receive a professional deliverable — fulfilled entirely by **MiniMax M3** running on **NVIDIA NIM**. Zero humans involved at any stage.

## Demo the flow (30 seconds)

1. Visit **`/`** → Submit a Brief → fill the form
2. The real-time **Brief Quality Scorer** evaluates your brief on 4 dimensions
3. Stripe Checkout opens → pay (test card `4242 4242 4242 4242`)
4. Land on cinematic confirmation with terminal-style **Live Status Stream**
5. Watch the AI queue → generate → deliver — typically 4–8 minutes
6. Open `/dashboard` → `/order/[id]` → read the deliverable, copy or download

## How it works (under the hood)

```
┌────────────┐    ┌─────────────┐    ┌──────────────┐     ┌──────────────────┐
│ /submit    │───▶│ POST /api/  │───▶│ Stripe       │────▶│ /api/webhooks/   │
│ brief form │    │ checkout    │    │ Checkout     │     │ stripe            │
└────────────┘    └─────────────┘    └──────────────┘     └────────┬─────────┘
                                                                 ▼
              ┌──────────────────────────────────────────────┐  ┌─────────────────┐
              │ - Brief Quality Scorer (real-time)           │  │ order created   │
              │ - 3-tier pricing toggle                       │  │ → fulfill queue │
              │ - Live status stream (SSE)                     │  └────────┬────────┘
              │ - Terminal-style deliverable panel             │           │
              └──────────────────────────────────────────────┘           ▼
                                                           MiniMax M3 (NVIDIA NIM)
                                                                            │
                                                                            ▼
                                                          ┌─────────────────────────────────┐
                                                          │ /order/[id] — full deliverable  │
                                                          │ /api/fulfill/[id]/stream (SSE)  │
                                                          └─────────────────────────────────┘
```

1. Client submits a brief at `/submit`
2. **BriefQualityScorer** scores the brief in real time (Specificity · Verifiability · Completeness · Structuredness)
3. Client pays via Stripe Checkout
4. Stripe webhook (`/api/webhooks/stripe` — `checkout.session.completed`) creates the order
5. The fulfill pipeline triggers MiniMax M3 via NVIDIA NIM autonomously
6. Client watches the **LiveStatusStream** (SSE) update in real-time
7. Client downloads deliverable at `/order/[id]`

## Tech stack

| Layer          | Tech                                         |
| -------------- | -------------------------------------------- |
| Frontend       | Next.js 14 (App Router), TypeScript, Tailwind CSS v4 |
| Database       | Supabase (PostgreSQL + RLS + pg_cron)        |
| Payments       | Stripe (Checkout + Webhooks, idempotent)     |
| AI             | MiniMax M3 via NVIDIA NIM                    |
| Deployment     | Vercel                                       |
| Agent          | Hermes (Nous Research)                       |
| Streaming      | Server-Sent Events for live status           |

## Key features

- **BriefQualityScorer** — real-time 4-dimension quality scoring
- **LiveStatusStream** — terminal-style real-time fulfillment UI
- **Cinematic confirmation** — split layout with macOS-styled terminal
- **/gallery** — sample deliverables, filterable by category
- **Auto-refreshing dashboard** — orders table updates every 60s
- **Revision flow** — free revision via `RevisionForm`
- **Error boundaries** — `app/error.tsx` + reusable `ErrorBoundary` component
- **Custom 404**, **SEO** metadata (OG + Twitter cards), **sitemap.xml**, **robots.txt**

## Local development

```bash
git clone https://github.com/adnanshaikhhh/hermes-concierge
cd hermes-concierge
npm install
cp .env.example .env.local       # fill in real values
npm run dev
```

Required env vars (see `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_LOOKUP_ENABLED=true
MINIMAX_API_BASE=https://integrate.api.nvidia.com/v1
MINIMAX_API_KEY=nvapi-...
MINIMAX_MODEL=minimaxai/minimax-m3
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For Stripe webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project structure

```
app/
├── layout.tsx              ← root layout + metadata + fonts
├── page.tsx                ← / (homepage)
├── submit/page.tsx         ← /submit (brief form)
├── gallery/page.tsx        ← /gallery (sample work)
├── dashboard/              ← /dashboard (orders)
├── order/
│   ├── [service]/          ← per-service order form
│   ├── success/            ← /order/success (confirmation + live stream)
│   └── detail/[id]/        ← /order/[id] (deliverable + actions)
├── api/
│   ├── checkout/           ← Stripe Checkout session creation
│   ├── webhooks/stripe/    ← Stripe webhook receiver (signed)
│   ├── fulfill/
│   │   ├── [orderId]/              ← manual fulfillment trigger
│   │   ├── [orderId]/stream/       ← SSE live status
│   │   └── [orderId]/status/       ← JSON status probe
│   ├── orders/[id]/revision/       ← revision request
│   ├── cron/process-orders/        ← fulfillment cron
│   └── services/                   ← services catalog
├── auth/                   ← /auth/* (login, callback)
└── error.tsx, not-found.tsx, sitemap.ts, favicon.svg

components/
├── Navbar.tsx              ← sticky nav with mobile hamburger
├── BriefQualityScorer.tsx  ← 4-dimension quality analyzer
├── LiveStatusStream.tsx    ← SSE consumer + step indicator
├── TerminalStream.tsx      ← cinematic terminal-style panel
├── DeliveryViewer.tsx      ← markdown render + copy/download
├── ErrorBoundary.tsx       ← reusable class-based boundary
├── OrderStatus.tsx         ← status pill component
└── Skeleton.tsx            ← shimmer skeletons

lib/
├── stripe.ts               ← Stripe SDK bootstrap
├── fulfill.ts              ← fulfillment pipeline (email + status)
├── minimax.ts              ← MiniMax M3 / NVIDIA NIM client
├── supabase/{server,client}.ts
└── utils.ts
```

## Built by

**[@adnanshaikhhh](https://github.com/adnanshaikhhh)** — solo builder, AI-assisted development.
Built entirely using **Hermes Agent + MiniMax M3**.

## License

MIT — go build something ridiculous.
