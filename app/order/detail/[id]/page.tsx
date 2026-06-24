import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatus } from "@/components/OrderStatus";
import { DeliveryViewer } from "@/components/DeliveryViewer";
import { RevisionForm } from "./RevisionForm";
import { AutoRefresh } from "./AutoRefresh";
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
  const isWorking = ["pending", "processing", "revision_requested", "revision_processing"].includes(order.status);
  const isComplete = order.status === "complete";
  const canRevise = isComplete && !order.revision_brief;
  const showRevision = !!order.revision_content;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-xs text-[#4a5980] hover:text-[#8b9dc3]"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to dashboard
      </Link>

      <AutoRefresh active={isWorking} />

      {/* Header */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-xs text-[#4a5980]">
          <Hash className="h-3 w-3" />
          <span className="font-mono">{order.id}</span>
          <span>·</span>
          <Clock className="h-3 w-3" />
          <span>{formatDate(order.created_at)}</span>
        </div>
        <div className="mb-2 flex items-start justify-between gap-4">
          <h1 className="h2-heading text-[#f0f4ff]">{order.title}</h1>
          <OrderStatus status={order.status} />
        </div>
        <div className="flex items-center gap-3 text-sm text-[#8b9dc3]">
          <span>{order.services?.name || order.service_id}</span>
          <span>·</span>
          <span className="font-mono">{formatPrice(order.amount_cents, order.currency)}</span>
        </div>
      </div>

      {/* Status timeline */}
      <div className="mb-8 rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-6">
        <div className="mb-4 text-xs font-medium uppercase tracking-widest text-[#4a5980]">
          Timeline
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Step
            n={1}
            label="Order placed"
            done
            sub={formatDate(order.created_at)}
          />
          <Step
            n={2}
            label={hasDelivery ? "Delivered" : "Processing"}
            done={hasDelivery}
            sub={order.fulfilled_at ? formatDate(order.fulfilled_at) : "In progress"}
            active={!hasDelivery && order.status !== "pending"}
          />
          <Step
            n={3}
            label="Done"
            done={isComplete}
            sub={isComplete ? "Ready to use" : "Awaiting delivery"}
          />
        </div>
      </div>

      {/* Brief */}
      <div className="mb-8 rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-6">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#4a5980]">
          Your brief
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#f0f4ff]">
          {order.brief}
        </p>
        {order.context && (
          <div className="mt-4 border-t border-[#1e2d4a] pt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[#4a5980]">
              Context
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#8b9dc3]">
              {order.context}
            </p>
          </div>
        )}
      </div>

      {/* Delivery */}
      {hasDelivery && (
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium uppercase tracking-widest text-[#4a5980]">
              Delivered work
            </div>
            {order.minimax_tokens_used && (
              <div className="text-xs text-[#4a5980]">
                {order.minimax_tokens_used.toLocaleString()} tokens used
              </div>
            )}
          </div>
          <DeliveryViewer content={order.fulfilled_content} title={order.title} />
        </div>
      )}

      {!hasDelivery && isWorking && (
        <div className="rounded-lg border border-[#1e2d4a] bg-[#0e1420] p-6 text-center text-sm text-[#9fb0d0]">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          Your agent is preparing the deliverable… this page updates automatically.
        </div>
      )}

      {/* Revision */}
      {showRevision && (
        <div className="mb-8">
          <div className="mb-3 text-xs font-medium uppercase tracking-widest text-[#3b6fe8]">
            Revision
          </div>
          <DeliveryViewer content={order.revision_content} title={`${order.title} (revised)`} />
          <div className="mt-3 rounded-md border border-[#1e2d4a] bg-[#0e1420] p-3 text-xs text-[#8b9dc3]">
            <span className="font-medium text-[#f0f4ff]">Your feedback: </span>
            {order.revision_brief}
          </div>
        </div>
      )}

      {/* Revision form */}
      {canRevise && (
        <div className="mb-8 rounded-xl border border-[#2a4080] bg-[#0e1420] p-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#3b6fe8]">
            Request revision
          </div>
          <h3 className="mb-1 text-base font-semibold text-[#f0f4ff]">
            Not quite right?
          </h3>
          <p className="mb-4 text-sm text-[#8b9dc3]">
            One free revision is included. Tell the agent what to change and
            it'll redeliver.
          </p>
          <RevisionForm orderId={order.id} />
        </div>
      )}

      {/* Audit log */}
      {actions && actions.length > 0 && (
        <details className="rounded-xl border border-[#1e2d4a] bg-[#0e1420]">
          <summary className="cursor-pointer p-4 text-sm font-medium text-[#8b9dc3] hover:text-[#f0f4ff]">
            Agent action log ({actions.length})
          </summary>
          <div className="border-t border-[#1e2d4a] p-4">
            <div className="space-y-2 font-mono text-xs">
              {actions.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 border-l-2 border-[#1e2d4a] pl-3"
                >
                  <span className="text-[#4a5980]">
                    {formatDate(a.created_at)}
                  </span>
                  <span
                    className={
                      a.success
                        ? "text-[#10b981]"
                        : "text-[#ef4444]"
                    }
                  >
                    {a.success ? "✓" : "✗"} {a.action_type}
                  </span>
                  <span className="flex-1 text-[#8b9dc3]">
                    {a.output_summary || a.error_message || "—"}
                  </span>
                  {a.latency_ms && (
                    <span className="text-[#4a5980]">{a.latency_ms}ms</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </details>
      )}
    </div>
  );
}

function Step({
  n,
  label,
  done,
  active,
  sub,
}: {
  n: number;
  label: string;
  done: boolean;
  active?: boolean;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold ${
          done
            ? "border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
            : active
            ? "border-[#3b6fe8] bg-[#3b6fe8]/10 text-[#3b6fe8] status-pulse"
            : "border-[#2a4080] bg-[#0e1420] text-[#4a5980]"
        }`}
      >
        {done ? "✓" : n}
      </div>
      <div className="flex-1 pt-0.5">
        <div
          className={`text-sm font-medium ${
            done ? "text-[#f0f4ff]" : active ? "text-[#3b6fe8]" : "text-[#8b9dc3]"
          }`}
        >
          {label}
        </div>
        {sub && <div className="text-xs text-[#4a5980]">{sub}</div>}
      </div>
    </div>
  );
}
