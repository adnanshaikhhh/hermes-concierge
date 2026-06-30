import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrice, relativeTime } from "@/lib/utils";
import { OrderRowCard } from "./OrderRowCard";
import { DashboardRefresh } from "./DashboardRefresh";
import { Inbox, Plus, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  title: string;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
  service_id: string;
  services: { id: string; name: string } | { id: string; name: string }[] | null;
};

type StatusBuckets = {
  pending: number;
  processing: number;
  delivered: number;
  failed: number;
};

function fmtStatus(s: string): keyof StatusBuckets {
  if (s === "complete" || s === "revision_complete") return "delivered";
  if (s === "failed") return "failed";
  if (s === "processing" || s === "revision_processing") return "processing";
  return "pending";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=/dashboard");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, services(id, name)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const list: OrderRow[] = (orders as OrderRow[]) ?? [];

  const buckets: StatusBuckets = {
    pending: 0,
    processing: 0,
    delivered: 0,
    failed: 0,
  };
  list.forEach((o) => {
    buckets[fmtStatus(o.status)] += 1;
  });

  const totalSpent = list
    .filter((o) => o.status === "complete" || o.status === "revision_complete")
    .reduce((sum, o) => sum + (o.amount_cents || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 fade-in">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
            Dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
            Your Orders
          </h1>
        </div>
        <Link
          href="/submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
        >
          <Sparkles className="h-4 w-4" /> New Brief
        </Link>
      </div>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total" value={list.length} />
        <Stat label="Delivered" value={buckets.delivered} accent="text-[#10b981]" />
        <Stat label="Processing" value={buckets.processing} accent="text-[#3b82f6]" />
        <Stat label="Total Spent" value={formatPrice(totalSpent)} />
      </div>

      {/* Live refresh indicator */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#71717a]">
          {list.length === 0
            ? "When you submit briefs, they'll appear here."
            : `${list.length} order${list.length === 1 ? "" : "s"}`}
        </p>
        <DashboardRefresh />
      </div>

      {/* Orders list */}
      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1f1f1f] bg-[#111111]/40 p-12 text-center">
          <Inbox className="mx-auto mb-4 h-12 w-12 text-[#71717a]" />
          <h3 className="mb-2 text-xl font-semibold text-[#fafafa]">
            No orders yet
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-[#a1a1aa]">
            Place your first brief and watch our AI agent deliver in minutes.
            Zero humans involved.
          </p>
          <Link
            href="/submit"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            <Plus className="h-4 w-4" /> Submit your first brief →
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#111111] md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-[#1f1f1f] bg-[#161616] text-left text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Order</th>
                  <th className="px-5 py-3.5 font-medium">Category</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Date</th>
                  <th className="px-5 py-3.5 text-right font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((order) => {
                  const serviceName = Array.isArray(order.services)
                    ? order.services[0]?.name
                    : order.services?.name;
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-[#1f1f1f] last:border-0 transition hover:bg-[#161616]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#fafafa]">
                          {order.title}
                        </div>
                        <code className="font-mono text-xs text-[#71717a]">
                          {order.id.slice(0, 8)}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-[#a1a1aa]">
                        {serviceName ?? order.service_id}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-5 py-4 text-xs text-[#a1a1aa]">
                        {relativeTime(order.created_at)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-[#fafafa]">
                        {formatPrice(order.amount_cents, order.currency)}
                      </td>
                      <td className="px-5 py-4">
                        {(order.status === "complete" ||
                          order.status === "revision_complete") && (
                          <Link
                            href={`/order/detail/${order.id}`}
                            className="text-xs font-medium text-[#7c3aed] hover:text-[#a855f7]"
                          >
                            View →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {list.map((o) => (
              <OrderRowCard
                key={o.id}
                id={o.id}
                title={o.title}
                status={o.status}
                amountCents={o.amount_cents}
                currency={o.currency}
                createdAt={o.created_at}
                category={
                  Array.isArray(o.services)
                    ? o.services[0]?.name ?? o.service_id
                    : o.services?.name ?? o.service_id
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "text-[#fafafa]",
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1f1f1f] bg-[#111111] p-4">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
        {label}
      </div>
      <div className={`font-mono text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "complete" || status === "revision_complete") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#10b981]/30 bg-[#10b981]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#10b981]">
        Delivered
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ef4444]/30 bg-[#ef4444]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#ef4444]">
        Failed
      </span>
    );
  }
  if (status === "processing" || status === "revision_processing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#3b82f6]">
        <span className="status-pulse inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#71717a]/30 bg-[#71717a]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">
      Pending
    </span>
  );
}
