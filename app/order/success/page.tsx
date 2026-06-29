import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderSidebar } from "./OrderSidebar";
import TerminalStream from "@/components/TerminalStream";
import { ArrowRight, Home } from "lucide-react";

export const dynamic = "force-dynamic";

type OrderSuccess = {
  id: string;
  title: string;
  status: string;
  amount_cents: number;
  currency: string;
  created_at: string;
  services: { name: string } | { name: string }[] | null;
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orderData: OrderSuccess | null = null;
  if (user && order) {
    const { data } = await supabase
      .from("orders")
      .select(
        "id, title, status, amount_cents, currency, created_at, services(name)",
      )
      .eq("id", order)
      .eq("client_id", user.id)
      .single();
    orderData = data as OrderSuccess | null;
  }

  const serviceName = orderData
    ? (Array.isArray(orderData.services)
        ? orderData.services[0]?.name
        : orderData.services?.name)
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 fade-in">
      {orderData ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
          {/* ─── Left 40%: Order summary ───────────────────────── */}
          <div className="lg:col-span-2">
            <OrderSidebar
              orderId={orderData.id}
              title={orderData.title}
              serviceName={serviceName}
              amountCents={orderData.amount_cents}
              currency={orderData.currency}
              createdAt={orderData.created_at}
            />
          </div>

          {/* ─── Right 60%: Live status stream ──────────────────── */}
          <div className="lg:col-span-3">
            <TerminalStream orderId={orderData.id} initiallyDone={orderData.status === "complete"} />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-md py-24 text-center">
          <p className="text-base text-[#a1a1aa]">
            Order received. You can track progress from your{" "}
            <Link
              href="/dashboard"
              className="font-medium text-[#7c3aed] underline underline-offset-2"
            >
              dashboard
            </Link>
            .
          </p>
        </div>
      )}

      {/* Bottom links */}
      <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center gap-3 sm:flex-row">
        {orderData && (
          <Link
            href={`/order/detail/${orderData.id}`}
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:shadow-[0_0_30px_rgba(124,58,237,0.45)]"
          >
            View Full Order <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-[#1f1f1f] bg-[#111111] px-5 text-sm font-medium text-[#a1a1aa] transition hover:border-[#7c3aed]/40 hover:text-[#fafafa]"
        >
          <Home className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}
