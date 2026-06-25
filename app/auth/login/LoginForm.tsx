"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const appUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for the magic link");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-md border border-[#10b981]/30 bg-[#10b981]/10 p-4 text-sm text-[#10b981]">
        <div className="mb-1 font-semibold">Check your email.</div>
        <div className="text-xs text-[#8b9dc3]">
          We sent a sign-in link to <span className="font-mono">{email}</span>.
          Click it to continue.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#8b9dc3]"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="w-full rounded-md border border-[#1e2d4a] bg-[#080b14] px-3 py-2.5 text-sm text-[#f0f4ff] placeholder-[#4a5980] outline-none transition focus:border-[#3b6fe8]"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full rounded-md bg-[#3b6fe8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a7ef0] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "Sending…" : "Send magic link →"}
      </button>
    </form>
  );
}
