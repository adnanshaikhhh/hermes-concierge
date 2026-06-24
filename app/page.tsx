import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT_SERVICES = [
  {
    id: "research-brief",
    name: "Research Brief",
    description:
      "Comprehensive research on any topic with key findings, data points, and actionable insights.",
    price_cents: 900,
    estimated_minutes: 4,
  },
  {
    id: "copywriting",
    name: "Copywriting",
    description:
      "Persuasive, conversion-focused copy for landing pages, emails, ads, or product descriptions.",
    price_cents: 1500,
    estimated_minutes: 5,
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    description:
      "Structured analysis of data, trends, or metrics with clear findings and visual-ready summaries.",
    price_cents: 1900,
    estimated_minutes: 6,
  },
  {
    id: "strategy-report",
    name: "Strategy Report",
    description:
      "In-depth strategic analysis, market assessment, or business planning document.",
    price_cents: 2900,
    estimated_minutes: 8,
  },
  {
    id: "competitor-analysis",
    name: "Competitor Analysis",
    description:
      "Detailed breakdown of competitors, their positioning, strengths, weaknesses, and market gaps.",
    price_cents: 2400,
    estimated_minutes: 7,
  },
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
      services = data;
    }
  } catch {
    // DB not yet seeded; use defaults
  }

  return (
    <div className="grid-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#3b6fe8]/20 blur-3xl"
        />
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 sm:px-8 sm:pt-28 lg:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            Agents live · accepting orders now
          </div>
          <h1 className="display-heading mb-6 max-w-3xl text-4xl font-bold tracking-tight text-[#f0f4ff] sm:text-5xl md:text-6xl">
            Your work,
            <br />
            <span className="bg-gradient-to-r from-[#3b6fe8] via-[#8b5cf6] to-[#3b6fe8] bg-clip-text text-transparent">
              done.
            </span>
          </h1>
          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-[#8b9dc3]">
            AI-powered delivery for research, writing, and analysis. Pay once,
            receive in minutes.{" "}
            <span className="text-[#f0f4ff]">Zero humans required.</span>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-neutral-500">
            Built for operators who would rather be doing the work than
            coordinating the people who do the work.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#services"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#3b6fe8] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#3b6fe8]/30 transition hover:bg-[#4a7ef0] hover:shadow-md hover:shadow-[#3b6fe8]/40 sm:w-auto"
            >
              Start a brief →
            </a>
            <a
              href="/dashboard"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#2a4080] bg-[#0e1420] px-5 py-3 text-sm font-semibold text-[#f0f4ff] transition hover:border-[#3b6fe8] hover:bg-[#141b2d] sm:w-auto"
            >
              View dashboard
            </a>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-[#4a5980]">
            <span>
              Powered by{" "}
              <span className="font-semibold text-[#8b9dc3]">MiniMax M3</span>
            </span>
            <span>·</span>
            <span>
              Secured by{" "}
              <span className="font-semibold text-[#8b9dc3]">Stripe</span>
            </span>
            <span>·</span>
            <span>No account required to browse</span>
          </div>
        </div>
        <div className="glow-line mx-auto max-w-5xl" />
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#3b6fe8]">
              Services
            </div>
            <h2 className="h2-heading text-[#f0f4ff]">
              One brief. One price. One delivery.
            </h2>
          </div>
          <div className="hidden text-sm text-[#4a5980] sm:block">
            5 services · pay per delivery
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((s) => (
            <ServiceCardDisplay key={s.id} service={s} />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.slice(3).map((s) => (
            <ServiceCardDisplay key={s.id} service={s} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#3b6fe8]">
            How it works
          </div>
          <h2 className="h2-heading text-[#f0f4ff]">Three steps. No calls.</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              t: "Write a brief",
              d: "Pick a service, describe what you need in plain language. No template, no kickoff call.",
            },
            {
              n: "02",
              t: "Pay with Stripe",
              d: "One transparent price. Stripe Checkout. Money-back if we don't deliver.",
            },
            {
              n: "03",
              t: "Receive the work",
              d: "An autonomous agent fulfills the brief. You get a notification when it's done. One free revision included.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/10 text-sm font-bold text-indigo-600">
                {s.n}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#f0f4ff]">
                {s.t}
              </h3>
              <p className="text-sm leading-relaxed text-[#8b9dc3]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2d4a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-[#4a5980] sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#3b6fe8] to-[#8b5cf6]">
              <span className="text-[10px] font-bold text-white">H</span>
            </div>
            <span>Hermes Concierge · {new Date().getFullYear()}</span>
          </div>
          <div>
            Built for operators who would rather be doing the work than
            coordinating the people who do the work.
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCardDisplay({ service }: { service: any }) {
  const isPopular = service.id === "strategy-report";
  return (
    <a href={`/order/${service.id}`} className="block">
      <div
        className={`gradient-border-card group relative h-full transition duration-200 hover:-translate-y-1 hover:shadow-lg ${isPopular ? "border-indigo-500 ring-1 ring-indigo-500/30" : ""}`}
      >
        {isPopular && (
          <span className="absolute -top-3 left-6 z-10 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Most popular
          </span>
        )}
        <div className="gradient-border-card-inner flex h-full flex-col">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="text-lg font-semibold text-[#f0f4ff]">
              {service.name}
            </h3>
            <span className="badge-mono rounded border border-[#2a4080] bg-[#3b6fe8]/10 px-2 py-0.5 text-2xl font-bold tracking-tight text-[#3b6fe8]">
              ${(service.price_cents / 100).toFixed(0)}
            </span>
          </div>
          <p className="mb-6 flex-1 text-sm leading-relaxed text-[#8b9dc3]">
            {service.description}
          </p>
          <div className="flex items-center justify-between border-t border-[#1e2d4a] pt-4">
            <div className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span>~{service.estimated_minutes} min delivery</span>
            </div>
            <span className="text-sm font-medium text-[#3b6fe8]">Order →</span>
          </div>
        </div>
      </div>
    </a>
  );
}
