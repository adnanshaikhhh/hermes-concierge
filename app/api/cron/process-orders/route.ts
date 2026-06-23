import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { fulfillOrder } from "@/lib/fulfill";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const headerList = await headers();
  const authHeader = headerList.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();

  // Find pending/revision_requested orders older than 30 seconds
  const cutoff = new Date(Date.now() - 30_000).toISOString();
  const { data: pending } = await supabase
    .from("orders")
    .select("id, status")
    .or(`status.eq.pending,status.eq.revision_requested`)
    .lt("created_at", cutoff)
    .limit(10);

  if (!pending || pending.length === 0) {
    return NextResponse.json({ processed: 0, message: "No pending orders" });
  }

  const results = await Promise.allSettled(
    pending.map((o) => fulfillOrder(o.id))
  );

  const processed = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ processed, total: pending.length });
}
