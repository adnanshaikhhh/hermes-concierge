"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BriefQualityScorer from "@/components/BriefQualityScorer";
import { ChevronDown, Check, Calendar } from "lucide-react";

const CATEGORIES = [
  { id: "research-brief", label: "Research", price: 9 },
  { id: "copywriting", label: "Copywriting", price: 15 },
  { id: "data-analysis", label: "Data Analysis", price: 19 },
  { id: "strategy-report", label: "Strategy", price: 29 },
  { id: "competitor-analysis", label: "Code Review", price: 24 },
  { id: "content-creation", label: "Content Creation", price: 19 },
  { id: "other", label: "Other", price: 19 },
];

const TIERS = [
  {
    id: "basic",
    label: "Basic",
    price: 19,
    desc: "Quick tasks",
    blurb: "Up to ~1,500 words · 48-hour revisions",
  },
  {
    id: "pro",
    label: "Pro",
    price: 49,
    desc: "Deep work",
    blurb: "Up to ~5,000 words · citations included",
    popular: true,
  },
  {
    id: "enterprise",
    label: "Enterprise",
    price: 99,
    desc: "Complex projects",
    blurb: "Up to ~15,000 words · priority queue",
  },
];

const MIN_BRIEF = 50;
const MAX_BRIEF = 2000;

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [tier, setTier] = useState<string>("pro");
  const [brief, setBrief] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Close category dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selectedCategory = CATEGORIES.find((c) => c.id === category)!;
  const selectedTier = TIERS.find((t) => t.id === tier)!;
  // Display price mirrors tier; backend charges per-category but frontend UX is tier-first.
  const displayPrice = selectedTier.price;
  const briefLen = brief.length;
  const briefValid = briefLen >= MIN_BRIEF && briefLen <= MAX_BRIEF;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (!briefValid) {
      setError(
        `Brief must be ${MIN_BRIEF}–${MAX_BRIEF} characters (${briefLen} currently).`,
      );
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      const tierNote = `[Tier: ${selectedTier.label} (${displayPrice} USD)]`;
      const blendedContext = [context.trim(), tierNote]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: category,
          title: title.trim(),
          brief: brief.trim(),
          context: blendedContext || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.href = data.url;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid-bg flex min-h-screen items-start justify-center px-4 py-16">
      {/* Animated checkmark overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#10b981]/10">
              <Check className="h-10 w-10 text-[#10b981]" strokeWidth={3} />
            </div>
            <p className="text-lg font-semibold text-[#fafafa]">
              Redirecting to payment…
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[680px] fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
            New Brief
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#fafafa]">
            Submit Your Brief
          </h1>
          <p className="mt-3 text-base text-[#a1a1aa]">
            Describe what you need. Our AI handles the rest.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)]"
        >
          {/* Project Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#fafafa]">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Market analysis for AI startups"
              maxLength={200}
              className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#fafafa] placeholder-[#71717a] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/40"
            />
          </div>

          {/* Category — custom dark dropdown */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#fafafa]">
              Category
            </label>
            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryOpen((s) => !s)}
                className="flex w-full items-center justify-between rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-left text-sm text-[#fafafa] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/40"
              >
                <span>{selectedCategory.label}</span>
                <ChevronDown
                  className={`h-4 w-4 text-[#71717a] transition-transform ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>
              {categoryOpen && (
                <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-md border border-[#1f1f1f] bg-[#111111] shadow-xl shadow-black/40">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.id);
                        setCategoryOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-[#161616] ${
                        category === c.id
                          ? "bg-[#161616] text-[#7c3aed]"
                          : "text-[#fafafa]"
                      }`}
                    >
                      <span>{c.label}</span>
                      {category === c.id && (
                        <Check className="h-4 w-4 text-[#7c3aed]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tier toggle — 3-button group */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#fafafa]">
              Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => {
                const selected = tier === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`relative flex flex-col items-start rounded-lg border px-3 py-3 text-left transition ${
                      selected
                        ? "border-[#7c3aed] bg-[#7c3aed]/10 text-[#fafafa] shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                        : "border-[#1f1f1f] bg-[#0a0a0a] text-[#a1a1aa] hover:border-[#7c3aed]/40 hover:text-[#fafafa]"
                    }`}
                  >
                    {t.popular && (
                      <span className="absolute -top-2 left-3 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                        Popular
                      </span>
                    )}
                    <span className="text-sm font-semibold">{t.label}</span>
                    <span className="font-mono text-lg font-bold text-[#fafafa]">
                      ${t.price}
                    </span>
                    <span className="mt-1 text-[11px] text-[#71717a]">
                      {t.blurb}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brief */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#fafafa]">
              Detailed Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe your project in detail. The more specific you are, the better your deliverable will be."
              rows={10}
              maxLength={MAX_BRIEF}
              className="min-h-[200px] w-full resize-y rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-3 text-sm leading-relaxed text-[#fafafa] placeholder-[#71717a] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/40"
            />
            <div
              className={`mt-1.5 flex items-center justify-between text-xs ${
                briefLen < MIN_BRIEF ? "text-[#ef4444]" : "text-[#71717a]"
              }`}
            >
              <span>
                {briefLen < MIN_BRIEF
                  ? `Minimum ${MIN_BRIEF} characters required`
                  : `${briefLen} / ${MAX_BRIEF} characters`}
              </span>
              <span className="font-mono">{briefLen}</span>
            </div>
            {briefLen >= MIN_BRIEF && (
              <div className="mt-4">
                <BriefQualityScorer brief={brief} />
              </div>
            )}
          </div>

          {/* Deadline (optional) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#a1a1aa]">
              <Calendar className="mr-1.5 inline h-3.5 w-3.5" />
              Deadline <span className="text-[#71717a]">(optional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#fafafa] outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/40"
            />
          </div>

          {/* Price summary */}
          <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#fafafa]">
                  {selectedCategory.label} · {selectedTier.label}
                </p>
                <p className="mt-0.5 text-xs text-[#71717a]">
                  One-time payment · Money-back guarantee
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-2xl font-bold text-[#7c3aed]">
                  ${displayPrice}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#ef4444]">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !briefValid}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Creating your order…
              </>
            ) : (
              "Continue to Payment →"
            )}
          </button>

          <p className="text-center text-xs text-[#71717a]">
            Secure Stripe Checkout · No charge until payment completes
          </p>
        </form>
      </div>
    </div>
  );
}
