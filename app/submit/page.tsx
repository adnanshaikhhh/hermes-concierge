"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BriefQualityScorer from "@/components/BriefQualityScorer";

const CATEGORIES = [
  { id: "research-brief", label: "Research Brief", price: 9 },
  { id: "copywriting", label: "Copywriting", price: 15 },
  { id: "data-analysis", label: "Data Analysis", price: 19 },
  { id: "strategy-report", label: "Strategy Report", price: 29 },
  { id: "competitor-analysis", label: "Competitor Analysis", price: 24 },
] as const;

const MIN_BRIEF = 50;
const MAX_BRIEF = 5000;

export default function SubmitPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [brief, setBrief] = useState("");
  const [context, setContext] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedCategory = CATEGORIES.find((c) => c.id === category)!;
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
      setError(`Brief must be ${MIN_BRIEF}–${MAX_BRIEF} characters (${briefLen} currently).`);
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

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: category,
          title: title.trim(),
          brief: brief.trim(),
          context: context.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed.");
        setSubmitting(false);
        return;
      }

      // Show animated checkmark before redirect
      setSuccess(true);
      setTimeout(() => {
        window.location.href = data.url;
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid-bg flex min-h-screen items-start justify-center px-4 py-16">
      {/* Animated checkmark overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#10b981]/10">
              <svg
                className="h-10 w-10 text-[#10b981]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-[#f0f4ff]">Redirecting to payment…</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-[640px]">
        <div className="mb-8">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
            New Brief
          </div>
          <h1 className="text-3xl font-bold text-[#f0f4ff]">Submit a Brief</h1>
          <p className="mt-2 text-sm text-[#8b9dc3]">
            Describe what you need. Pay once. Receive your deliverable — no humans involved.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.4)]"
        >
          {/* Project Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#f0f4ff]">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Market analysis for AI startups"
              maxLength={200}
              className="w-full rounded-[4px] border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#f0f4ff]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-[4px] border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f0f4ff] outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — ${c.price}
                </option>
              ))}
            </select>
          </div>

          {/* Brief */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#f0f4ff]">
              Detailed Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe what you need in detail. The more context, the better the deliverable…"
              rows={8}
              maxLength={MAX_BRIEF}
              className="w-full resize-y rounded-[4px] border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm leading-relaxed text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
            />
            <div className={`mt-1 text-xs ${briefValid ? "text-[#4a5980]" : "text-[#ef4444]"}`}>
              {briefLen} / {MAX_BRIEF} {briefLen < MIN_BRIEF && `— minimum ${MIN_BRIEF} characters`}
            </div>
            <div className="mt-3">
              <BriefQualityScorer brief={brief} />
            </div>
          </div>

          {/* Context (optional) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#8b9dc3]">
              Additional Context <span className="text-[#4a5980]">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Links, files, brand voice notes, target audience…"
              rows={3}
              className="w-full resize-y rounded-[4px] border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          {/* Deadline (optional) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#8b9dc3]">
              Deadline <span className="text-[#4a5980]">(optional)</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full rounded-[4px] border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2.5 text-sm text-[#f0f4ff] outline-none transition focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          {/* Price summary */}
          <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#f0f4ff]">{selectedCategory.label}</p>
                <p className="text-xs text-[#4a5980]">One-time payment · Money-back guarantee</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#7c3aed]">${selectedCategory.price}</p>
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
            className="w-full rounded-[6px] bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Submitting…
              </span>
            ) : (
              "Submit & Pay →"
            )}
          </button>

          <p className="text-center text-xs text-[#4a5980]">
            You'll be redirected to secure Stripe Checkout. No charge until payment completes.
          </p>
        </form>
      </div>
    </div>
  );
}
