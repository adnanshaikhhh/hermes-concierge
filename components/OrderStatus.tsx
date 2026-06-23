"use client";

import { cn, statusColor, statusLabel } from "@/lib/utils";

export function OrderStatus({ status }: { status: string }) {
  const isLive = ["pending", "processing", "revision_requested", "revision_processing"].includes(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        statusColor(status)
      )}
    >
      {isLive && <span className="status-pulse h-1.5 w-1.5 rounded-full bg-current" />}
      {statusLabel(status)}
    </span>
  );
}
