import { createServiceClient } from "./supabase/server";
import { callMiniMaxM3 } from "./minimax";
import { Resend } from "resend";
import { ORDER_STATUS } from "./order-status";

const ALLOWED_REVISION_STATUSES = new Set<string>([
  ORDER_STATUS.REVISION_REQUESTED,
]);

export type FulfillResult = {
  success: boolean;
  status: string;
  error?: string;
  tokensIn?: number;
  tokensOut?: number;
};

export async function fulfillOrder(orderId: string): Promise<FulfillResult> {
  const actionStart = Date.now();
  const supabase = createServiceClient();

  // 1. Fetch order + service
  const { data: order, error: fetchErr } = await supabase
    .from("orders")
    .select("*, services(*)")
    .eq("id", orderId)
    .single();

  if (fetchErr || !order) {
    return { success: false, status: "missing", error: "Order not found" };
  }

  // Payment gate: never fulfill an initial order that has not been paid.
  if (
    order.status === ORDER_STATUS.PENDING &&
    !order.stripe_payment_intent_id
  ) {
    return { success: true, status: order.status };
  }

  // Idempotency: skip if not in a state that needs fulfillment
  const isRevision = order.status === ORDER_STATUS.REVISION_REQUESTED;
  const isInitial = order.status === ORDER_STATUS.PENDING;
  if (!isInitial && !ALLOWED_REVISION_STATUSES.has(order.status)) {
    return { success: true, status: order.status };
  }

  // 2. Atomically claim the order so concurrent duplicate events can't double-fulfill
  if (isRevision) {
    await supabase
      .from("orders")
      .update({ status: ORDER_STATUS.REVISION_PROCESSING })
      .eq("id", orderId);
  } else {
    const { data: claimed } = await supabase
      .from("orders")
      .update({ status: ORDER_STATUS.PROCESSING })
      .eq("id", orderId)
      .eq("status", ORDER_STATUS.PENDING)
      .select("id");
    if (!claimed || claimed.length === 0) {
      return { success: true, status: ORDER_STATUS.PROCESSING }; // another worker already claimed it
    }
  }

  // 2b. Load client email (orders table has no client_email column; it lives on clients)
  let clientEmail: string | null = null;
  if (order.client_id) {
    const { data: client } = await supabase
      .from("clients")
      .select("email")
      .eq("id", order.client_id)
      .single();
    clientEmail = client?.email ?? null;
  }

  try {
    // 3. Build prompts
    const template: string = order.services.prompt_template;
    const brief = isRevision ? order.revision_brief : order.brief;
    const systemPrompt = template
      .replace("{brief}", brief || "")
      .replace("{context}", order.context || "No additional context provided.");

    const revisionNote = isRevision
      ? `\n\nIMPORTANT: This is a REVISION request.\n\nOriginal delivered work:\n---\n${order.fulfilled_content || ""}\n---\n\nRevision instructions: ${order.revision_brief}\n\nRefine and improve the original work based on this feedback.`
      : "";

    const userPrompt = `Deliver the ${order.services.name} as requested. Title: "${order.title}"${revisionNote}`;

    // 4. Call LLM
    const result = await callMiniMaxM3(systemPrompt, userPrompt);

    // 5. Persist delivered content
    const updateData = isRevision
      ? {
          status: ORDER_STATUS.REVISION_COMPLETE,
          revision_content: result.content,
          revision_fulfilled_at: new Date().toISOString(),
          minimax_tokens_used:
            (order.minimax_tokens_used || 0) + result.tokensIn + result.tokensOut,
          used_fallback: result.usedFallback,
        }
      : {
          status: ORDER_STATUS.COMPLETE,
          fulfilled_content: result.content,
          fulfilled_at: new Date().toISOString(),
          minimax_tokens_used: result.tokensIn + result.tokensOut,
          used_fallback: result.usedFallback,
        };

    await supabase.from("orders").update(updateData).eq("id", orderId);

    // 6. Audit log
    await supabase.from("agent_actions").insert({
      order_id: orderId,
      action_type: isRevision ? "revision" : "fulfill",
      input_summary: `Service: ${order.services.name}, Brief length: ${(brief || "").length} chars`,
      output_summary: `Delivered ${result.content.length} chars (${result.model}${result.usedFallback ? ", fallback" : ""})`,
      tokens_in: result.tokensIn,
      tokens_out: result.tokensOut,
      latency_ms: result.latencyMs,
      success: true,
    });

    // 7. Email notification
    await notifyClient(order, clientEmail, result.content, isRevision).catch((e) =>
      console.error("Email failed:", e)
    );

    return {
      success: true,
      status: isRevision
        ? ORDER_STATUS.REVISION_COMPLETE
        : ORDER_STATUS.COMPLETE,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("orders")
      .update({ status: ORDER_STATUS.FAILED })
      .eq("id", orderId);
    await supabase.from("agent_actions").insert({
      order_id: orderId,
      action_type: isRevision ? "revision" : "fulfill",
      success: false,
      error_message: message,
      latency_ms: Date.now() - actionStart,
    });
    return { success: false, status: ORDER_STATUS.FAILED, error: message };
  }
}

type NotifyOrder = {
  id: string;
  title: string;
  services: { name: string } | { name: string }[] | null;
};

async function notifyClient(
  order: NotifyOrder,
  clientEmail: string | null,
  content: string,
  isRevision: boolean
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "re_placeholder") {
    // LOUD warning — never silent. Operators need to know delivery
    // notifications aren't going out so they can wire Resend before
    // launch.
    console.warn(
      `[email] ⚠️ NOT CONFIGURED — would send ${isRevision ? "revision" : "delivery"} for order ${order.id}. Set RESEND_API_KEY in Vercel (and verify FROM_EMAIL's domain in Resend before launch).`
    );
    return;
  }

  if (!clientEmail) {
    console.warn(
      `[email] no client email for order ${order.id} — skipping notification.`
    );
    return;
  }

  const resend = new Resend(apiKey);
  const serviceName = Array.isArray(order.services) ? order.services[0]?.name : order.services?.name;
  const subject = isRevision
    ? `✅ Your revision is ready — ${order.title}`
    : `✅ Your ${serviceName ?? "delivery"} is ready — ${order.title}`;

  // Absolute app URL — fall back to Vercel production host so the email
  // link is never a localhost or relative href.
  const appUrl =
    (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "") ||
    "https://hermes-concierge-ten.vercel.app";

  await resend.emails.send({
    from: process.env.FROM_EMAIL || "noreply@hermesconcierge.com",
    to: clientEmail,
    subject,
    html: `
      <div style="font-family: Inter, system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #080B14; color: #F0F4FF; padding: 40px; border-radius: 12px;">
        <div style="font-size: 12px; color: #3B6FE8; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 16px;">HERMES CONCIERGE</div>
        <h1 style="font-size: 24px; font-weight: 700; color: #F0F4FF; margin: 0 0 8px 0;">Your work is ready.</h1>
        <p style="color: #8B9DC3; margin: 0 0 24px 0;">Order: <strong style="color: #F0F4FF;">${order.title}</strong></p>
        <p style="color: #8B9DC3; margin: 0 0 24px 0;">Service: ${serviceName ?? "delivery"}</p>
        <div style="margin: 24px 0; padding: 20px; background: #0E1420; border-radius: 8px; border: 1px solid #1E2D4A;">
          <p style="font-size: 12px; color: #4A5980; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.1em;">Preview</p>
          <p style="color: #F0F4FF; line-height: 1.6; margin: 0; font-size: 14px;">${content
            .replace(/[#*`]/g, "")
            .slice(0, 300)}…</p>
        </div>
        <a href="${appUrl}/order/detail/${order.id}"
           style="display: inline-block; background: #3B6FE8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">
          View Full Delivery →
        </a>
        <p style="color: #4A5980; font-size: 12px; margin-top: 32px;">Powered by MiniMax M3. Secured by Stripe. Zero humans required.</p>
      </div>
    `,
  });
}
