import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

const ALLOWED_SERVICES = new Set([
  "research-brief",
  "copywriting",
  "data-analysis",
  "strategy-report",
  "competitor-analysis",
]);

const BRIEF_MIN = 50;
const BRIEF_MAX = 5000;

export async function POST(req: Request) {
  let payload: any;
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

  // Fetch service from DB to get authoritative price
  const { data: service, error: svcErr } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .eq("active", true)
    .single();

  if (svcErr || !service) {
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
