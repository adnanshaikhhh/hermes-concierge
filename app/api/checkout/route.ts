import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { CheckoutPayload } from "@/lib/utils";

const ALLOWED_SERVICES = new Set([
  "research-brief",
  "copywriting",
  "data-analysis",
  "strategy-report",
  "competitor-analysis",
]);

const BRIEF_MIN = 50;
const BRIEF_MAX = 5000;

const SERVICE_FALLBACK: Record<string, { name: string; description: string; price_cents: number }> = {
  "research-brief": { name: "Research Brief", description: "Comprehensive research on any topic with key findings, data points, and actionable insights.", price_cents: 900 },
  "copywriting": { name: "Copywriting", description: "Persuasive, conversion-focused copy for landing pages, emails, ads, or product descriptions.", price_cents: 1500 },
  "data-analysis": { name: "Data Analysis", description: "Structured analysis of data, trends, or metrics with clear findings and visual-ready summaries.", price_cents: 1900 },
  "strategy-report": { name: "Strategy Report", description: "In-depth strategic analysis, market assessment, or business planning document.", price_cents: 2900 },
  "competitor-analysis": { name: "Competitor Analysis", description: "Detailed breakdown of competitors, their positioning, strengths, weaknesses, and market gaps.", price_cents: 2400 },
};

export async function POST(req: Request) {
  let payload: CheckoutPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { serviceId, title, brief, context, specialInstructions } = payload;

  // Server-side validation
  if (!serviceId || !ALLOWED_SERVICES.has(serviceId)) {
    return NextResponse.json({ error: "Invalid service" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || title.length < 3 || title.length > 200) {
    return NextResponse.json({ error: "Title must be 3–200 characters" }, { status: 400 });
  }
  if (!brief || typeof brief !== "string" || brief.length < BRIEF_MIN || brief.length > BRIEF_MAX) {
    return NextResponse.json(
      { error: `Brief must be ${BRIEF_MIN}–${BRIEF_MAX} characters` },
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

  // Rate limit: max 10 orders / hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("client_id", user.id)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= 10) {
    return NextResponse.json(
      { error: "Rate limit: max 10 orders per hour" },
      { status: 429 }
    );
  }

  // Fetch service from DB to get authoritative price; fall back to hardcoded defaults if table is empty
  const { data: dbService } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("active", true)
    .single();

  const service = dbService || SERVICE_FALLBACK[serviceId];
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  // Create order first (so we have an ID for Stripe metadata)
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      client_id: user.id,
      service_id: serviceId,
      title: title.trim(),
      brief: brief.trim(),
      context: context?.trim() || null,
      special_instructions: specialInstructions?.trim() || null,
      amount_cents: service.price_cents,
      status: "pending",
    })
    .select()
    .single();

  if (orderErr || !order) {
    console.error("Order insert failed:", orderErr);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }

  // Ensure client record exists
  await supabase
    .from("clients")
    .upsert({ id: user.id, email: user.email! }, { onConflict: "id" });

  const appUrl =
    req.headers.get("origin") ||
    (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "") ||
    new URL(req.url).origin ||
    "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: service.name,
              description: service.description,
            },
            unit_amount: service.price_cents,
          },
          quantity: 1,
        },
      ],
      customer_email: user.email!,
      metadata: { order_id: order.id, service_id: serviceId },
      success_url: `${appUrl}/order/success?session_id={CHECKOUT_SESSION_ID}&order=${order.id}`,
      cancel_url: `${appUrl}/order/${serviceId}?cancelled=1`,
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Payment setup failed" },
      { status: 500 }
    );
  }
}
