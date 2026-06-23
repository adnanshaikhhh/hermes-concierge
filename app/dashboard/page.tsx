import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { OrderStatus } from "@/components/OrderStatus";
import { formatDate, formatPrice, relativeTime } from "@/lib/utils";
import { FileText, Plus, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

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

  const list = orders || [];

  const totalSpent = list
    .filter((o) => o.status === "complete" || o.status === "revision_complete")
    .reduce((sum, o) => sum + (o.amount_cents || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#3b6fe8]">
            Dashboard
          </div>
          <h1 className="h2-heading text-[#f0f4ff]">Your orders</h1>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-[#3b6fe8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a7ef0]"
        >
          <Plus className="h-4 w-4" />
          New order
        </Link>
      </div>

      {/* Stats strip */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total orders" value={list.length.toString()} />
        <Stat
          label="Completed"
          value={list.filter((o) => o.status === "complete" || o.status === "revision_complete").length.toString()}
        />
        <Stat
          label="In progress"
          value={list.filter((o) => ["pending", "processing", "revision_requested", "revision_processing"].includes(o.status)).length.toString()}
        />
        <Stat label="Total spent" value={formatPrice(totalSpent)} />
      </div>

      {/* Orders */}
      {list.length === 0 ? (
        <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-12 text-center">
          <Inbox className="mx-auto mb-4 h-10 w-10 text-[#4a5980]" />
          <h3 className="mb-1 text-base font-semibold text-[#f0f4ff]">
            No orders yet
          </h3>
          <p className="mb-6 text-sm text-[#8b9dc3]">
            Place your first brief and watch the agent deliver in minutes.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-[#3b6fe8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4a7ef0]"
          >
            Browse services →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1e2d4a] bg-[#0e1420]">
          <table className="w-full text-sm">
            <thead className="border-b border-[#1e2d4a] bg-[#141b2d] text-left text-xs uppercase tracking-wider text-[#4a5980]">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#1e2d4a] last:border-0 transition hover:bg-[#141b2d]/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#f0f4ff]">
                      {order.title}
                    </div>
                    <div className="font-mono text-xs text-[#4a5980]">
                      {order.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#8b9dc3]">
                    {order.services?.name || order.service_id}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatus status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8b9dc3]">
                    {relativeTime(order.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-[#f0f4ff]">
                    {formatPrice(order.amount_cents, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/order/detail/${order.id}`}
                      className="text-xs font-medium text-[#3b6fe8] hover:text-[#4a7ef0]"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1e2d4a] bg-[#0e1420] p-4">
      <div className="mb-1 text-xs font-medium uppercase tracking-wider text-[#4a5980]">
        {label}
      </div>
      <div className="text-xl font-bold text-[#f0f4ff]">{value}</div>
    </div>
  );
}
