"use client";

import Link from "next/link";
import { formatPrice, relativeTime } from "@/lib/utils";

export function OrderRowCard({
  id,
  title,
  category,
  status,
  amountCents,
  currency,
  createdAt,
}: {
  id: string;
  title: string;
  category: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
}) {
  const delivered =
    status === "complete" || status === "revision_complete";
  return (
    <Link
      href={`/order/detail/${id}`}
      className="block rounded-xl border border-[#1f1f1f] bg-[#111111] p-4 transition hover:border-[#7c3aed]/40"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-[#fafafa]">
            {title}
          </div>
          <code className="font-mono text-[10px] text-[#71717a]">
            {id.slice(0, 8)}
          </code>
        </div>
        <span className="font-mono text-sm font-bold text-[#7c3aed]">
          {formatPrice(amountCents, currency)}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#71717a]">
        <span>{category}</span>
        <span>{relativeTime(createdAt)}</span>
      </div>
      {delivered && (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#7c3aed]">
          Tap to view →
        </div>
      )}
    </Link>
  );
}
