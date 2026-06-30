import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="font-mono text-[120px] font-bold leading-none tracking-tight text-[#7c3aed] sm:text-[160px]">
        404
      </div>
      <h1 className="mb-3 mt-2 text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
        This brief doesn&apos;t exist yet.
      </h1>
      <p className="mb-10 max-w-md text-base text-[#a1a1aa]">
        But yours could. Start something real — submit a brief and watch our AI
        deliver in minutes.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/submit"
          className="inline-flex h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
        >
          <Sparkles className="h-4 w-4" /> Submit a Brief →
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#1f1f1f] bg-[#111111] px-6 text-sm font-medium text-[#a1a1aa] transition hover:border-[#7c3aed]/40 hover:text-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
      </div>
    </div>
  );
}
