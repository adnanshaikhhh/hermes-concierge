import { CheckCircle2, Copy } from "lucide-react";

function formatPrice(cents: number, currency: string) {
  return `$${(cents / 100).toFixed(2)} ${(currency || "USD").toUpperCase()}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderSidebar({
  orderId,
  title,
  serviceName,
  amountCents,
  currency,
  createdAt,
}: {
  orderId: string;
  title: string;
  serviceName?: string;
  amountCents: number;
  currency: string;
  createdAt: string;
}) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#10b981]/10">
          <CheckCircle2 className="h-6 w-6 text-[#10b981]" />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#10b981]">
            Order Confirmed
          </div>
          <div className="text-sm font-medium text-[#a1a1aa]">
            Payment received
          </div>
        </div>
      </div>

      {/* Order ID */}
      <div className="mb-6">
        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
          Order ID
        </div>
        <div className="flex items-center justify-between rounded-md border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-2">
          <code className="font-mono text-sm text-[#fafafa]">
            {orderId.slice(0, 8)}…{orderId.slice(-4)}
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(orderId)}
            className="text-[#71717a] transition hover:text-[#7c3aed]"
            aria-label="Copy order ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mb-6 space-y-3 border-y border-[#1f1f1f] py-6">
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
            Brief
          </div>
          <div className="text-sm font-medium text-[#fafafa]">{title}</div>
        </div>
        {serviceName && (
          <div>
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
              Category
            </div>
            <span className="inline-flex items-center rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7c3aed]">
              {serviceName}
            </span>
          </div>
        )}
        <div>
          <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
            Submitted
          </div>
          <div className="font-mono text-xs text-[#a1a1aa]">
            {formatDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Amount */}
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
          Amount paid
        </span>
        <span className="font-mono text-3xl font-bold text-[#7c3aed]">
          {formatPrice(amountCents, currency)}
        </span>
      </div>
    </div>
  );
}
