import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type OrderSuccess = {
  id: string;
  title: string;
  status: string;
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
      .select("id, title, status, services(name)")
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
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#10b981] bg-[#10b981]/10">
        <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
      </div>
      <h1 className="h2-heading mb-3 text-[#f0f4ff]">Payment received.</h1>
      <p className="mb-2 text-base text-[#8b9dc3]">
        The agent is already working on your brief.
      </p>
      {orderData && (
        <p className="mb-8 text-sm text-[#4a5980]">
          <span className="font-mono">{orderData.id.slice(0, 8)}</span>
          {" · "}
          {serviceName} · {orderData.title}
        </p>
      )}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {orderData ? (
          <Link
            href={`/order/detail/${orderData.id}`}
            className="inline-flex items-center gap-2 rounded-md bg-[#3b6fe8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a7ef0]"
          >
            Watch delivery <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-[#3b6fe8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a7ef0]"
          >
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-[#2a4080] bg-[#0e1420] px-5 py-2.5 text-sm font-semibold text-[#f0f4ff] transition hover:border-[#3b6fe8]"
        >
          Place another order
        </Link>
      </div>
      <p className="mt-10 text-xs text-[#4a5980]">
        We'll email you the moment your work is ready. Average delivery time: 4–8 minutes.
      </p>
    </div>
  );
}
