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
  { value: "4–8 min", label: "Avg delivery" },
  { value: "< 2 min", label: "Brief to agent" },
  { value: "Zero", label: "Human delay" },
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
            Agents live · accepting orders now
          </div>

          {/* Headline */}
          <h1 className="mb-6 max-w-3xl text-5xl font-bold tracking-tight text-[#f0f4ff] sm:text-6xl lg:text-7xl">
            The AI Agency
            <br />
            <span className="bg-gradient-to-r from-[#7c3aed] via-[#3b6fe8] to-[#06b6d4] bg-clip-text text-transparent">
              That Never Sleeps
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#8b9dc3] sm:text-xl">
            Submit a brief. Pay once. Receive your deliverable —{" "}
            <span className="font-medium text-[#f0f4ff]">no humans involved.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#services"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7c3aed]/25 transition hover:shadow-xl hover:shadow-[#7c3aed]/35 sm:w-auto"
            >
              Submit a Brief →
            </a>
            <a
              href="#how-it-works"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#2a4080] bg-[#0e1420] px-6 py-3.5 text-sm font-semibold text-[#f0f4ff] transition hover:border-[#7c3aed]/50 hover:bg-[#141b2d] sm:w-auto"
            >
              See How It Works
            </a>
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
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[#1e2d4a] bg-[#1e2d4a]">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center bg-[#0a0a0a] px-4 py-6"
            >
              <span className="text-2xl font-bold tracking-tight text-[#f0f4ff] sm:text-3xl">
                {s.value}
              </span>
              <span className="mt-1 text-xs font-medium uppercase tracking-wider text-[#4a5980]">
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
      <footer className="border-t border-[#1e2d4a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-[#4a5980] sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#7c3aed] to-[#3b6fe8]">
              <span className="text-[10px] font-bold text-white">H</span>
            </div>
            <span>Hermes Concierge · {new Date().getFullYear()}</span>
          </div>
          <div>
            Built for Hermes × NVIDIA × Stripe Hackathon 2025
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
