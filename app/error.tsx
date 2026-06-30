"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console — Vercel surfaces these in the deployment logs.
    console.error("[app/error.tsx] page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#ef4444]/30 bg-[#ef4444]/10">
        <AlertCircle className="h-8 w-8 text-[#ef4444]" />
      </div>
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-[#fafafa]">
        Something went wrong.
      </h1>
      <p className="mb-2 text-base text-[#a1a1aa]">
        We hit an unexpected error rendering this page.
      </p>
      {error.message && (
        <p className="mb-8 max-w-md font-mono text-xs text-[#71717a]">
          {error.message}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
        >
          <RefreshCcw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#1f1f1f] bg-[#111111] px-5 text-sm font-medium text-[#a1a1aa] transition hover:border-[#7c3aed]/40 hover:text-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}
