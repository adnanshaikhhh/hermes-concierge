import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fulfillOrder } from "@/lib/fulfill";
import { ORDER_STATUS } from "@/lib/order-status";

const REVISION_MIN = 20;
const REVISION_MAX = 2000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { revision_brief } = payload as { revision_brief?: unknown };

  if (
    !revision_brief ||
    typeof revision_brief !== "string" ||
    revision_brief.length < REVISION_MIN ||
    revision_brief.length > REVISION_MAX
  ) {
    return NextResponse.json(
      { error: `Revision must be ${REVISION_MIN}–${REVISION_MAX} characters` },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  // Fetch the order — RLS ensures only owner can see
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status !== ORDER_STATUS.COMPLETE) {
    return NextResponse.json(
      { error: "Order must be complete before requesting a revision" },
      { status: 400 }
    );
  }

  if (order.revision_brief) {
    return NextResponse.json(
      { error: "Revision already used" },
      { status: 400 }
    );
  }

  // Update order with revision request
  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      revision_brief: revision_brief.trim(),
      revision_requested_at: new Date().toISOString(),
      status: ORDER_STATUS.REVISION_REQUESTED,
    })
    .eq("id", id);

  if (updateErr) {
    console.error("Revision update failed:", updateErr);
    return NextResponse.json(
      { error: "Failed to submit revision" },
      { status: 500 }
    );
  }

  // Trigger fulfillment
  fulfillOrder(id).catch((e) => console.error("Revision fulfill error:", e));

  return NextResponse.json({ ok: true });
}
