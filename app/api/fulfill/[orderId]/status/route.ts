import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TERMINAL_SUCCESS_STATUSES, TERMINAL_FAILURE_STATUSES } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("status, result_url")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ type: "error", error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    type: "status",
    status: order.status,
    result_url: order.result_url ?? null,
    isTerminalSuccess: TERMINAL_SUCCESS_STATUSES.includes(order.status as (typeof TERMINAL_SUCCESS_STATUSES)[number]),
    isTerminalFailure: TERMINAL_FAILURE_STATUSES.includes(order.status as (typeof TERMINAL_FAILURE_STATUSES)[number]),
  });
}
