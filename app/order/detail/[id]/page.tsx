import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeliveryViewer } from "@/components/DeliveryViewer";
import { RevisionForm } from "./RevisionForm";
import { AutoRefresh } from "./AutoRefresh";
import LiveStatusStream from "@/components/LiveStatusStream";
import { formatDate, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Clock, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?redirect=/order/detail/${id}`);

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, services(*)")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (error || !order) notFound();

  const { data: actions } = await supabase
    .from("agent_actions")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  const hasDelivery = !!order.fulfilled_content;
  const isWorking = [
    "pending",
    "processing",
    "revision_requested",
    "revision_processing",
  ].includes(order.status);
  const isComplete = order.status === "complete";
  const canRevise = isComplete && !order.revision_brief;
  const showRevision = !!order.revision_content;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 fade-in">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-xs text-[#71717a] transition hover:text-[#a1a1aa]"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      <AutoRefresh active={isWorking} />

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-xs text-[#71717a]">
          <Hash className="h-3 w-3" />
          <span className="font-mono">{order.id}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="mb-2 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
            {order.title}
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#a1a1aa]">
          <span>{order.services?.name || order.service_id}</span>
          <span>·</span>
          <span className="font-mono text-[#7c3aed]">
            {formatPrice(order.amount_cents, order.currency)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        {/* ─── Left: Brief + meta ──────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Brief */}
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#7c3aed]">
              Your Brief
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#fafafa]">
              {order.brief}
            </p>
            {order.context && (
              <div className="mt-4 border-t border-[#1f1f1f] pt-4">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
                  Additional Context
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#a1a1aa]">
                  {order.context}
                </p>
              </div>
            )}
          </div>

          {/* Metadata card */}
          <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#71717a]">
              Metadata
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#71717a]">Order ID</dt>
                <dd className="font-mono text-xs text-[#fafafa]">
                  {order.id.slice(0, 8)}…
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#71717a]">Status</dt>
                <dd className="text-[#fafafa]">{order.status}</dd>
              </div>
              {order.fulfilled_at && (
                <div className="flex justify-between">
                  <dt className="text-[#71717a]">Delivered</dt>
                  <dd className="text-[#fafafa]">
                    {formatDate(order.fulfilled_at)}
                  </dd>
                </div>
              )}
              {order.minimax_tokens_used && (
                <div className="flex justify-between">
                  <dt className="text-[#71717a]">Tokens used</dt>
                  <dd className="font-mono text-[#fafafa]">
                    {order.minimax_tokens_used.toLocaleString()}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Revision form */}
          {canRevise && (
            <div className="rounded-2xl border border-[#7c3aed]/40 bg-gradient-to-b from-[#1a0a2e]/40 to-[#111111] p-6">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-widest text-[#7c3aed]">
                Request Revision
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#fafafa]">
                Not quite right?
              </h3>
              <p className="mb-4 text-sm text-[#a1a1aa]">
                One free revision is included. Tell the agent what to change
                and it&apos;ll redeliver.
              </p>
              <RevisionForm orderId={order.id} />
            </div>
          )}

          {/* Audit log */}
          {actions && actions.length > 0 && (
            <details className="rounded-2xl border border-[#1f1f1f] bg-[#111111]">
              <summary className="cursor-pointer p-5 text-sm font-medium text-[#a1a1aa] transition hover:text-[#fafafa]">
                Agent action log ({actions.length})
              </summary>
              <div className="border-t border-[#1f1f1f] p-5">
                <div className="space-y-2 font-mono text-xs">
                  {actions.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 border-l-2 border-[#1f1f1f] pl-3"
                    >
                      <span className="text-[#71717a]">
                        {formatDate(a.created_at)}
                      </span>
                      <span
                        className={
                          a.success ? "text-[#10b981]" : "text-[#ef4444]"
                        }
                      >
                        {a.success ? "✓" : "✗"} {a.action_type}
                      </span>
                      <span className="flex-1 text-[#a1a1aa]">
                        {a.output_summary || a.error_message || "—"}
                      </span>
                      {a.latency_ms && (
                        <span className="text-[#71717a]">{a.latency_ms}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </details>
          )}
        </div>

        {/* ─── Right: Deliverable OR live stream ────────────────── */}
        <div className="lg:col-span-3">
          {/* Live stream while working */}
          {isWorking && (
            <div className="mb-6">
              <LiveStatusStream orderId={order.id} />
            </div>
          )}

          {hasDelivery && (
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6 lg:p-8">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-[11px] font-medium uppercase tracking-widest text-[#10b981]">
                  Delivered Work
                </div>
                {order.minimax_tokens_used && (
                  <div className="text-xs text-[#71717a]">
                    {order.minimax_tokens_used.toLocaleString()} tokens used
                  </div>
                )}
              </div>
              <DeliveryViewer
                content={order.fulfilled_content}
                title={order.title}
              />
            </div>
          )}

          {!hasDelivery && isWorking && (
            <div className="rounded-2xl border border-[#1f1f1f] bg-[#111111] p-8 text-center text-sm text-[#a1a1aa]">
              <span className="mb-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <p>Your agent is preparing the deliverable…</p>
              <p className="mt-1 text-xs text-[#71717a]">
                This page updates automatically.
              </p>
            </div>
          )}

          {order.status === "failed" && (
            <div className="rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/5 p-6 text-sm text-[#ef4444]">
              <p className="font-medium">Delivery didn&apos;t complete.</p>
              <p className="mt-1 text-[#a1a1aa]">
                Our agent hit an error. No charge will be made. Please retry
                your brief or contact support.
              </p>
            </div>
          )}

          {showRevision && order.revision_content && (
            <div className="mt-6 rounded-2xl border border-[#1f1f1f] bg-[#111111] p-6">
              <div className="mb-3 text-[11px] font-medium uppercase tracking-widest text-[#7c3aed]">
                Revision
              </div>
              <DeliveryViewer
                content={order.revision_content}
                title={`${order.title} (revised)`}
              />
              {order.revision_brief && (
                <div className="mt-3 rounded-md border border-[#1f1f1f] bg-[#0a0a0a] p-3 text-xs text-[#a1a1aa]">
                  <span className="font-medium text-[#fafafa]">
                    Your feedback:{" "}
                  </span>
                  {order.revision_brief}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 flex justify-center">
        <Link
          href="/submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
        >
          Submit Another Brief →
        </Link>
      </div>
    </div>
  );
}
