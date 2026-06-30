import { after } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { fulfillOrder } from "@/lib/fulfill";
import { ORDER_STATUS } from "@/lib/order-status";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const sig = headerList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return new Response("No order_id in metadata", { status: 400 });
    }

    const supabase = createServiceClient();
    await supabase
      .from("orders")
      .update({
        status: ORDER_STATUS.PENDING,
        stripe_payment_intent_id: (session.payment_intent as string) || null,
      })
      .eq("id", orderId);

    // Trigger fulfillment — fire and forget; cron will pick up if this fails.
    // Use after() so the runtime keeps this promise alive after the 200
    // response is sent (Vercel won't cut the function off under us).
    after(() => fulfillOrder(orderId).catch((e) => console.error("Fulfill error:", e)));

    await supabase.from("agent_actions").insert({
      order_id: orderId,
      action_type: "stripe_webhook",
      input_summary: "checkout.session.completed",
      output_summary: `Session ${session.id} confirmed`,
      success: true,
    });
  }

  return new Response("OK", { status: 200 });
}
