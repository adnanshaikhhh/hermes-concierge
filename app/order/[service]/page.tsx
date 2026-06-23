import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "./OrderForm";

const VALID_SERVICES = new Set([
  "research-brief",
  "copywriting",
  "data-analysis",
  "strategy-report",
  "competitor-analysis",
]);

export default async function OrderPage({
  params,
}: {
  params: Promise<{ service: string }>;
}) {
  const { service } = await params;
  if (!VALID_SERVICES.has(service)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch service from DB, fall back to defaults
  const DEFAULTS: Record<string, any> = {
    "research-brief": {
      name: "Research Brief",
      description: "Comprehensive research on any topic with key findings, data points, and actionable insights.",
      price_cents: 900,
      estimated_minutes: 4,
    },
    copywriting: {
      name: "Copywriting",
      description: "Persuasive, conversion-focused copy for landing pages, emails, ads, or product descriptions.",
      price_cents: 1500,
      estimated_minutes: 5,
    },
    "data-analysis": {
      name: "Data Analysis",
      description: "Structured analysis of data, trends, or metrics with clear findings and visual-ready summaries.",
      price_cents: 1900,
      estimated_minutes: 6,
    },
    "strategy-report": {
      name: "Strategy Report",
      description: "In-depth strategic analysis, market assessment, or business planning document.",
      price_cents: 2900,
      estimated_minutes: 8,
    },
    "competitor-analysis": {
      name: "Competitor Analysis",
      description: "Detailed breakdown of competitors, their positioning, strengths, weaknesses, and market gaps.",
      price_cents: 2400,
      estimated_minutes: 7,
    },
  };

  let serviceData = DEFAULTS[service];
  try {
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("id", service)
      .eq("active", true)
      .single();
    if (data) serviceData = data;
  } catch {}

  return (
    <div className="grid-bg min-h-[calc(100vh-65px)]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-1 text-xs text-[#4a5980] hover:text-[#8b9dc3]"
            >
              ← Back to services
            </a>
          </div>
          <h1 className="h2-heading mb-2 text-[#f0f4ff]">{serviceData.name}</h1>
          <p className="mb-8 text-sm leading-relaxed text-[#8b9dc3]">
            {serviceData.description}
          </p>

          {!user ? (
            <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-6 text-center">
              <p className="mb-4 text-sm text-[#8b9dc3]">
                Sign in to start your brief.
              </p>
              <a
                href={`/auth/login?redirect=/order/${service}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3b6fe8] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4a7ef0]"
              >
                Sign in to continue →
              </a>
            </div>
          ) : (
            <OrderForm
              serviceId={service}
              serviceName={serviceData.name}
              userEmail={user.email || ""}
            />
          )}
        </div>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-[#1e2d4a] bg-[#0e1420] p-6">
            <div className="mb-4 text-xs font-medium uppercase tracking-widest text-[#4a5980]">
              Order summary
            </div>
            <div className="mb-4 border-b border-[#1e2d4a] pb-4">
              <div className="text-sm font-medium text-[#f0f4ff]">
                {serviceData.name}
              </div>
              <div className="text-xs text-[#8b9dc3]">
                ~{serviceData.estimated_minutes} min delivery
              </div>
            </div>
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-sm text-[#8b9dc3]">Total</span>
              <span className="font-mono text-2xl font-bold text-[#f0f4ff]">
                ${(serviceData.price_cents / 100).toFixed(2)}
              </span>
            </div>
            <div className="space-y-2 border-t border-[#1e2d4a] pt-4 text-xs text-[#4a5980]">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#3b6fe8]" />
                <span>1 free revision included</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#3b6fe8]" />
                <span>Secured by Stripe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#3b6fe8]" />
                <span>Delivered to your dashboard</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
