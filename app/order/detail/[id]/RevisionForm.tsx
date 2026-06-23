"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function RevisionForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);

  const min = 20;
  const max = 2000;
  const valid = brief.length >= min && brief.length <= max;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/revision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision_brief: brief.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Revision requested — agent is on it");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={brief}
        onChange={(e) => setBrief(e.target.value)}
        placeholder="What should the agent change? Be specific."
        className="min-h-[100px] w-full resize-y rounded-md border border-[#1e2d4a] bg-[#0e1420] px-3 py-2.5 text-sm leading-relaxed text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#3b6fe8]"
        maxLength={max}
      />
      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            valid ? "text-[#10b981]" : brief.length > 0 ? "text-[#f59e0b]" : "text-[#4a5980]"
          }`}
        >
          {valid
            ? "✓ Ready"
            : brief.length === 0
            ? `${min}–${max} characters required`
            : `${min - brief.length} more needed`}
        </span>
        <button
          type="submit"
          disabled={!valid || loading}
          className="rounded-md bg-[#3b6fe8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a7ef0] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Submitting…" : "Request revision →"}
        </button>
      </div>
    </form>
  );
}
