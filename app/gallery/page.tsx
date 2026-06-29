"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

type Sample = {
  id: string;
  title: string;
  category:
    | "Copywriting"
    | "Research"
    | "Analysis"
    | "Strategy";
  brief: string;
  deliverable: string;
  price: number;
  deliveredIn: string;
};

const SAMPLES: Sample[] = [
  {
    id: "s1",
    title: "Competitive Landscape: AI Code Editors",
    category: "Analysis",
    brief:
      "We're launching an AI code editor next quarter. Map the top 5 competitors, their strengths, weaknesses, and where we can land.",
    deliverable:
      "The AI-powered code editor space has consolidated around three major players. Cursor leads in mindshare with a VS Code fork approach, while Windsurf (née Codeium) has pivoted to agent-first editing…",
    price: 24,
    deliveredIn: "6 min",
  },
  {
    id: "s2",
    title: "Go-to-Market for DevTool SaaS",
    category: "Strategy",
    brief:
      "We're a 4-person DevTool startup pre-launch. Plan our first $100k ARR — channels, sequencing, budget split.",
    deliverable:
      "Bottom-up adoption remains the dominant GTM motion for developer tools in 2025. The most successful launches combine three channels: (1) a generous free tier that becomes the team's default before procurement notices…",
    price: 29,
    deliveredIn: "8 min",
  },
  {
    id: "s3",
    title: "Q3 SaaS Retention Benchmarks",
    category: "Analysis",
    brief:
      "Pull the latest SaaS retention benchmarks by ARR band and pricing model. I want NRR, gross churn, and expansion rates.",
    deliverable:
      "Across 340 B2B SaaS companies analyzed, median net revenue retention fell to 108% in Q3 2025, down from 112% in Q2. The contraction is concentrated in the $1M–$10M ARR band…",
    price: 19,
    deliveredIn: "5 min",
  },
  {
    id: "s4",
    title: "Landing Page Copy: AI Agent Platform",
    category: "Copywriting",
    brief:
      "Write landing page hero + sub + 3 features for our AI agent platform. Confident, tight, no fluff. Reference Stripe & NVIDIA.",
    deliverable:
      "Stop hiring contractors for work an AI can do in minutes. Hermes Concierge delivers research, writing, and analysis — no humans, no delays, no equivocation…",
    price: 15,
    deliveredIn: "4 min",
  },
  {
    id: "s5",
    title: "State of Open-Source LLMs — 2025 H2",
    category: "Research",
    brief:
      "Survey the open-source LLM landscape: top models, where they win vs proprietary, fine-tuning trends, cost-per-token.",
    deliverable:
      "The open-source LLM landscape has matured significantly. Llama 4 Scout and Maverick now close the gap with proprietary models on most benchmarks, while Qwen 3 and DeepSeek V3 offer competitive performance…",
    price: 9,
    deliveredIn: "4 min",
  },
];

const FILTERS = ["All", "Copywriting", "Research", "Analysis", "Strategy"] as const;
type Filter = (typeof FILTERS)[number];

const CATEGORY_COLOR: Record<
  Sample["category"] | "Other",
  { bg: string; text: string; border: string }
> = {
  Copywriting: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  Research: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    border: "border-sky-500/30",
  },
  Analysis: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  Strategy: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    border: "border-violet-500/30",
  },
  Other: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/30",
  },
};

export default function GalleryPage() {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? SAMPLES
        : SAMPLES.filter((s) => s.category === filter),
    [filter],
  );

  return (
    <div className="grid-bg min-h-screen fade-in">
      {/* Header */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-20">
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
          Gallery
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#fafafa] sm:text-5xl">
          Work We&apos;ve Delivered
        </h1>
        <p className="max-w-2xl text-base text-[#a1a1aa]">
          Real deliverables from real briefs. Anonymized with permission. Every
          sample below was generated autonomously by MiniMax M3 on NVIDIA NIM.
        </p>
      </section>

      {/* Filter tabs */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                    : "border border-[#1f1f1f] bg-[#111111] text-[#a1a1aa] hover:border-[#7c3aed]/40 hover:text-[#fafafa]"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const color =
              CATEGORY_COLOR[s.category] ?? CATEGORY_COLOR.Other;
            return (
              <article
                key={s.id}
                className="group flex h-full flex-col rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-[#7c3aed]/50 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
              >
                {/* Category badge */}
                <span
                  className={`mb-4 inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${color.bg} ${color.text} ${color.border}`}
                >
                  {s.category}
                </span>

                {/* Title */}
                <h2 className="mb-3 text-base font-semibold leading-snug text-[#fafafa] transition group-hover:text-[#7c3aed]">
                  {s.title}
                </h2>

                {/* Brief preview */}
                <p className="mb-4 text-sm leading-relaxed text-[#a1a1aa] line-clamp-2">
                  {s.brief}
                </p>

                {/* Deliverable preview — mono */}
                <pre className="mb-6 flex-1 overflow-hidden whitespace-pre-wrap break-words rounded-md border border-[#1f1f1f] bg-[#0a0a0a] p-3 font-mono text-xs leading-relaxed text-[#71717a] line-clamp-3">
                  {s.deliverable}
                </pre>

                {/* Bottom row */}
                <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-4 text-xs">
                  <span className="font-mono font-medium text-[#7c3aed]">
                    ${s.price}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-[#a1a1aa] transition group-hover:text-[#7c3aed]">
                    View Sample <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#1f1f1f] bg-[#111111]/40 p-12 text-center text-sm text-[#71717a]">
            No samples in this category yet.
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-[#fafafa]">
            Your brief could be here.
          </p>
          <Link
            href="/submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
          >
            Submit a Brief →
          </Link>
        </div>
      </section>
    </div>
  );
}
