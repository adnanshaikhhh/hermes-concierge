import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { ServiceLite } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DEFAULT_SERVICES = [
  {
    id: "research-brief",
    name: "Research Brief",
    description:
      "Comprehensive research on any topic with key findings, data points, and actionable insights.",
    price_cents: 900,
    estimated_minutes: 4,
    icon: "🔍",
  },
  {
    id: "copywriting",
    name: "Copywriting",
    description:
      "Persuasive, conversion-focused copy for landing pages, emails, ads, or product descriptions.",
    price_cents: 1500,
    estimated_minutes: 5,
    icon: "✍️",
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description:
      "Structured analysis of data, trends, or metrics with clear findings and visual-ready summaries.",
    price_cents: 1900,
    estimated_minutes: 6,
    icon: "📊",
  },
  {
    id: "competitor-analysis",
    name: "Competitor Analysis",
    description:
      "Detailed breakdown of competitors, their positioning, strengths, weaknesses, and market gaps.",
    price_cents: 2400,
    estimated_minutes: 7,
    icon: "⚔️",
  },
  {
    id: "strategy-report",
    name: "Strategy Report",
    description:
      "In-depth strategic analysis, market assessment, or business planning document.",
    price_cents: 2900,
    estimated_minutes: 8,
    icon: "🎯",
  },
];

const STATS = [
  { value: "∞", label: "AVAILABILITY" },
  { value: "< 5min", label: "DELIVERY" },
  { value: "100%", label: "AI POWERED" },
];

export default async function Home() {
  const supabase = await createClient();

  let services = DEFAULT_SERVICES;
  try {
    const { data } = await supabase
      .from("services")
      .select("id, name, description, price_cents, estimated_minutes")
      .eq("active", true)
      .order("price_cents", { ascending: true });
    if (data && data.length > 0) {
      services = data.map((s) => ({
        ...s,
        icon: DEFAULT_SERVICES.find((d) => d.id === s.id)?.icon ?? "⚡",
      }));
    }
  } catch {
    // DB not yet seeded; use defaults
  }

  return (
    <div className="grid-bg">
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#7c3aed]/15 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-20 -z-10 h-[300px] w-[400px] rounded-full bg-[#3b6fe8]/10 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:pt-36">
          {/* Live badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            ⚡ Powered by MiniMax M3 · NVIDIA NIM
          </div>

          {/* Headline */}
          <h1 className="mb-8 max-w-4xl text-[48px] font-bold leading-[1.05] tracking-[-0.03em] text-[#fafafa] sm:text-[64px] lg:text-[80px]">
            Your work,
            <br />
            <span className="bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#7c3aed] bg-clip-text text-transparent">
              done.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-[560px] text-base text-[#a1a1aa] sm:text-[20px]">
            Submit a brief. Pay once. Your deliverable arrives in minutes — fulfilled by AI, zero humans involved.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#services"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition hover:shadow-xl hover:shadow-[#7c3aed]/35 sm:w-auto"
            >
              Submit a Brief →
            </a>
            <Link
              href="/gallery"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#2a4080] bg-[#0e1420] px-6 py-3.5 text-sm font-semibold text-[#fafafa] transition hover:border-[#7c3aed]/50 hover:bg-[#141b2d] sm:w-auto"
            >
              See Examples
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-[#4a5980]">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded bg-[#76b900]/20 text-center text-[8px] leading-4 font-bold text-[#76b900]">N</span>
              <span className="font-semibold text-[#8b9dc3]">NVIDIA NIM</span>
            </span>
            <span className="text-[#1e2d4a]">|</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-4 w-4 rounded bg-[#635bff]/20 text-center text-[8px] leading-4 font-bold text-[#635bff]">S</span>
              <span className="font-semibold text-[#8b9dc3]">Stripe</span>
            </span>
            <span className="text-[#1e2d4a]">|</span>
            <span className="font-semibold text-[#8b9dc3]">Zero Human Delay</span>
          </div>
        </div>
        <div className="glow-line mx-auto max-w-5xl" />
      </section>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="grid grid-cols-3 divide-y divide-[#1f1f1f] rounded-2xl border border-[#1f1f1f] bg-[#111111] sm:divide-y-0 sm:divide-x">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center px-4 py-8"
            >
              <span className="font-mono text-3xl font-bold tracking-tight text-[#7c3aed] sm:text-4xl">
                {s.value}
              </span>
              <span className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#71717a]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Services ─────────────────────────────────────────── */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
              Services
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#f0f4ff] sm:text-4xl">
              One brief. One price. One delivery.
            </h2>
          </div>
          <div className="hidden text-sm text-[#4a5980] sm:block">
            {services.length} services · pay per delivery
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCardDisplay key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
            Pricing
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-base text-[#a1a1aa]">
            Three tiers. Pay once. No subscriptions.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <PricingCard
            tier="BASIC"
            price="$19"
            desc="Quick Tasks"
            bullet1="Copy, research, summaries"
            bullet2="1 deliverable per brief"
            bullet3="Up to 1,500 words"
            bullet4="48-hour revision window"
          />
          <PricingCard
            popular
            tier="PRO"
            price="$49"
            desc="Deep Work"
            bullet1="Analysis, strategy, reports"
            bullet2="Up to 5,000 words"
            bullet3="Includes data citations"
            bullet4="Unlimited revisions (7 days)"
          />
          <PricingCard
            tier="ENTERPRISE"
            price="$99"
            desc="Complex Projects"
            bullet1="Full documents, code review"
            bullet2="Up to 15,000 words"
            bullet3="Multi-section deliverables"
            bullet4="Priority queue · 30-day revisions"
          />
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
            How it works
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#f0f4ff] sm:text-4xl">
            Three steps. No calls.
          </h2>
        </div>
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[16.67%] right-[16.67%] top-14 hidden h-px bg-gradient-to-r from-[#7c3aed]/40 via-[#3b6fe8]/40 to-[#06b6d4]/40 md:block"
          />
          {[
            {
              n: "01",
              t: "Submit Your Brief",
              d: "Describe what you need in plain language. No template, no kickoff call — just your words.",
              icon: "📝",
            },
            {
              n: "02",
              t: "Pay Once, Securely",
              d: "Stripe Checkout with transparent pricing. Money-back guarantee if we don't deliver.",
              icon: "💳",
            },
            {
              n: "03",
              t: "AI Delivers",
              d: "Our agent on NVIDIA NIM fulfills your brief autonomously. You get notified when it's ready.",
              icon: "🚀",
            },
          ].map((s, i) => (
            <div
              key={s.n}
              className="relative rounded-2xl border border-[#1e2d4a] bg-[#0e1420] p-8 transition duration-200 hover:-translate-y-1 hover:border-[#7c3aed]/30 hover:shadow-lg hover:shadow-[#7c3aed]/5"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed]/20 to-[#3b6fe8]/20 text-xl">
                {s.icon}
              </div>
              <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#7c3aed]">
                Step {s.n}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[#f0f4ff]">
                {s.t}
              </h3>
              <p className="text-sm leading-relaxed text-[#8b9dc3]">{s.d}</p>
              {i < 2 && (
                <div className="mt-4 text-[#7c3aed]/40 md:hidden">↓</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="relative overflow-hidden rounded-2xl border border-[#1e2d4a] bg-gradient-to-br from-[#0e1420] to-[#1a0a2e] p-12 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[#7c3aed]/10 blur-3xl"
          />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#f0f4ff] sm:text-4xl">
              Ready to delegate?
            </h2>
            <p className="mb-8 text-base text-[#8b9dc3]">
              Your next deliverable is 4 minutes away. No calls. No waiting. Just results.
            </p>
            <a
              href="/submit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition hover:shadow-xl hover:shadow-[#7c3aed]/35"
            >
              Submit Your First Brief →
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[#1f1f1f]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-2 px-6 py-8 text-center text-xs text-[#71717a]">
          <div className="flex items-center gap-2">
            <span className="text-[#7c3aed]">⚡</span>
            <span>
              Built for Hermes × NVIDIA × Stripe Hackathon · Powered by MiniMax M3 · © {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCardDisplay({ service }: { service: ServiceLite & { icon?: string } }) {
  const isPopular = service.id === "strategy-report";
  const icon = ("icon" in service ? service.icon : null) ?? "⚡";
  return (
    <a href={`/order/${service.id}`} className="block">
      <div
        className={`group relative h-full rounded-2xl border transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
          isPopular
            ? "border-[#7c3aed]/40 bg-gradient-to-b from-[#1a0a2e]/80 to-[#0e1420] shadow-md shadow-[#7c3aed]/10 hover:shadow-[#7c3aed]/20"
            : "border-[#1e2d4a] bg-[#0e1420] hover:border-[#7c3aed]/25 hover:shadow-[#7c3aed]/5"
        }`}
      >
        {isPopular && (
          <span className="absolute -top-3 left-6 z-10 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-3 py-1 text-xs font-semibold text-white shadow-md">
            Most popular
          </span>
        )}
        <div className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7c3aed]/10 text-lg">
                {icon}
              </span>
              <h3 className="text-lg font-semibold text-[#f0f4ff]">
                {service.name}
              </h3>
            </div>
            <span className="rounded-lg border border-[#2a4080] bg-[#7c3aed]/10 px-3 py-1 text-xl font-bold tracking-tight text-[#7c3aed]">
              ${(service.price_cents / 100).toFixed(0)}
            </span>
          </div>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-[#8b9dc3]">
            {service.description}
          </p>
          <div className="flex items-center justify-between border-t border-[#1e2d4a] pt-4">
            <div className="flex items-center gap-1.5 text-sm text-[#4a5980]">
              <span>~{service.estimated_minutes} min delivery</span>
            </div>
            <span className="text-sm font-medium text-[#7c3aed] group-hover:text-[#8b5cf6] transition-colors">
              Order →
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function PricingCard({
  tier,
  price,
  desc,
  bullet1,
  bullet2,
  bullet3,
  bullet4,
  popular = false,
}: {
  tier: string;
  price: string;
  desc: string;
  bullet1: string;
  bullet2: string;
  bullet3: string;
  bullet4: string;
  popular?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 transition duration-200 hover:-translate-y-1 ${
        popular
          ? "border-[#7c3aed]/50 bg-gradient-to-b from-[#1a0a2e]/60 to-[#111111] shadow-lg shadow-[#7c3aed]/10 hover:shadow-[#7c3aed]/20"
          : "border-[#1f1f1f] bg-[#111111] hover:border-[#7c3aed]/30"
      }`}
    >
      {popular && (
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
          Most Popular
        </span>
      )}
      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#71717a]">
        {tier}
      </div>
      <div className="mb-1 text-4xl font-bold tracking-tight text-[#fafafa]">
        {price}
      </div>
      <div className="mb-6 text-sm font-medium text-[#a1a1aa]">{desc}</div>
      <ul className="mb-8 space-y-3 text-sm text-[#a1a1aa]">
        {[bullet1, bullet2, bullet3, bullet4].map((b) => (
          <li key={b} className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#10b981]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/submit"
        className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
          popular
            ? "bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
            : "border border-[#1f1f1f] bg-[#161616] text-[#fafafa] hover:border-[#7c3aed]/40"
        }`}
      >
        Get Started →
      </Link>
    </div>
  );
}
