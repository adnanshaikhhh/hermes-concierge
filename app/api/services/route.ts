import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FALLBACK = [
  { id: "research-brief", name: "Research Brief", price_cents: 900, estimated_minutes: 4 },
  { id: "copywriting", name: "Copywriting", price_cents: 1500, estimated_minutes: 5 },
  { id: "data-analysis", name: "Data Analysis", price_cents: 1900, estimated_minutes: 6 },
  { id: "strategy-report", name: "Strategy Report", price_cents: 2900, estimated_minutes: 8 },
  { id: "competitor-analysis", name: "Competitor Analysis", price_cents: 2400, estimated_minutes: 7 },
];

export async function GET() {
  try {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("price_cents", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ services: FALLBACK });
    }
    return NextResponse.json({ services: data });
  } catch {
    return NextResponse.json({ services: FALLBACK });
  }
}
