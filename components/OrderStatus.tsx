"use client";

import { cn, statusColor, statusLabel } from "@/lib/utils";
import { IN_FLIGHT_STATUSES } from "@/lib/order-status";

export function OrderStatus({ status }: { status: string }) {
  // Use the canonical enum so the badge reflects what the rest of the
  // (post-fix) system considers in-flight vs terminal.
  const isLive = (IN_FLIGHT_STATUSES as readonly string[]).includes(status);
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
