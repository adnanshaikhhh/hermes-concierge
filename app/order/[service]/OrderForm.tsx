"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function OrderForm({
  serviceId,
  serviceName,
  userEmail,
}: {
  serviceId: string;
  serviceName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [context, setContext] = useState("");
  const [special, setSpecial] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const briefMin = 50;
  const briefMax = 5000;
  const briefValid = brief.length >= briefMin && brief.length <= briefMax;
  const titleValid = title.length >= 3 && title.length <= 200;
  const canSubmit = briefValid && titleValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          title: title.trim(),
          brief: brief.trim(),
          context: context.trim(),
          specialInstructions: special.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8b9dc3]"
        >
          Sending to
        </label>
        <div className="rounded-md border border-[#1e2d4a] bg-[#0e1420] px-3 py-2 text-sm text-[#8b9dc3]">
          {userEmail}
        </div>
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8b9dc3]"
        >
          Project title <span className="text-[#ef4444]">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Q3 strategy review for Series A pitch"
          className="w-full rounded-md border border-[#1e2d4a] bg-[#0e1420] px-3 py-2.5 text-sm text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#3b6fe8]"
          maxLength={200}
          required
        />
        <div className="mt-1 text-xs text-[#4a5980]">
          {title.length}/200 characters
        </div>
      </div>

      <div>
        <label
          htmlFor="brief"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8b9dc3]"
        >
          The brief <span className="text-[#ef4444]">*</span>
        </label>
        <textarea
          id="brief"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Describe what you need. The more specific, the better the output. At least 50 characters."
          className="min-h-[180px] w-full resize-y rounded-md border border-[#1e2d4a] bg-[#0e1420] px-3 py-2.5 text-sm leading-relaxed text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#3b6fe8]"
          maxLength={briefMax}
          required
        />
        <div className="mt-1 flex items-center justify-between text-xs">
          <span
            className={
              briefValid
                ? "text-[#10b981]"
                : brief.length > 0
                ? "text-[#f59e0b]"
                : "text-[#4a5980]"
            }
          >
            {briefValid
              ? "✓ Ready"
              : brief.length === 0
              ? `${briefMin}–${briefMax} characters required`
              : `${briefMin - brief.length} more character${briefMin - brief.length === 1 ? "" : "s"} needed`}
          </span>
          <span className="text-[#4a5980]">{brief.length}/{briefMax}</span>
        </div>
      </div>

      <div>
        <label
          htmlFor="context"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8b9dc3]"
        >
          Context <span className="text-[#4a5980]">(optional)</span>
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Background the agent should know. Audience, market, prior decisions, terminology."
          className="min-h-[80px] w-full resize-y rounded-md border border-[#1e2d4a] bg-[#0e1420] px-3 py-2.5 text-sm leading-relaxed text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#3b6fe8]"
          maxLength={2000}
        />
      </div>

      <div>
        <label
          htmlFor="special"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8b9dc3]"
        >
          Special instructions <span className="text-[#4a5980]">(optional)</span>
        </label>
        <input
          id="special"
          type="text"
          value={special}
          onChange={(e) => setSpecial(e.target.value)}
          placeholder="e.g. Tone: direct. Length: under 800 words. Include a chart description."
          className="w-full rounded-md border border-[#1e2d4a] bg-[#0e1420] px-3 py-2.5 text-sm text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#3b6fe8]"
          maxLength={500}
        />
      </div>

      {error && (
        <div className="rounded-md border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-sm text-[#ef4444]">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="group relative w-full overflow-hidden rounded-md bg-[#3b6fe8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4a7ef0] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Creating checkout…
          </span>
        ) : (
          <span>Proceed to Payment →</span>
        )}
      </button>

      <p className="text-center text-xs text-[#4a5980]">
        You'll be redirected to Stripe Checkout. Payment secures your order;
        delivery starts the moment payment clears.
      </p>
    </form>
  );
}
