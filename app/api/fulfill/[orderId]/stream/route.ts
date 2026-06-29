import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "queued", label: "Queued", icon: "⏳" },
  { key: "generating", label: "AI Generating", icon: "🧠" },
  { key: "reviewing", label: "Quality Review", icon: "🔍" },
  { key: "delivered", label: "Delivered", icon: "✅" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

const STATUS_TO_STEP: Record<string, StepKey> = {
  pending: "queued",
  processing: "generating",
  reviewing: "reviewing",
  completed: "delivered",
  failed: "queued", // reset visual
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  const supabase = await createClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Immediately send the step definitions so the client can render the skeleton
      send({ type: "steps", steps: STEPS });

      // Poll order status every 3 seconds, up to 5 minutes
      const MAX_POLLS = 100;
      for (let i = 0; i < MAX_POLLS; i++) {
        try {
          const { data: order } = await supabase
            .from("orders")
            .select("status, result_url")
            .eq("id", orderId)
            .single();

          if (order) {
            const currentStep = STATUS_TO_STEP[order.status] ?? "queued";
            const stepIndex = STEPS.findIndex((s) => s.key === currentStep);

            send({
              type: "status",
              currentStep,
              stepIndex,
              status: order.status,
              resultUrl: order.result_url ?? null,
            });

            // Terminal state — close stream
            if (order.status === "completed" || order.status === "failed") {
              send({ type: "done", status: order.status });
              break;
            }
          }
        } catch {
          // Supabase error — skip this poll
        }

        // Wait 3 seconds before next poll
        await new Promise((r) => setTimeout(r, 3000));
      }

      // Safety: close after max polls
      send({ type: "done", status: "timeout" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store",
      Connection: "keep-alive",
    },
  });
}
