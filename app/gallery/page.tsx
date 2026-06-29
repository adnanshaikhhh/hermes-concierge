import Link from "next/link";

const SAMPLES = [
  {
    id: "s1",
    title: "Competitive Landscape: AI Code Editors",
    category: "Competitor Analysis",
    preview:
      "The AI-powered code editor space has consolidated around three major players. Cursor leads in mindshare with a VS Code fork approach, while Windsurf (née Codeium) has pivoted to agent-first editing. Zed remains the performance-correct option but trails in AI feature depth. The key differentiator is no longer model quality — everyone uses Claude or GPT — but orchestration: how the editor handles multi-file edits, context window management, and human-in-the-loop approval flows.",
    price: 24,
    deliveredIn: "6 min",
  },
  {
    id: "s2",
    title: "Go-to-Market for DevTool SaaS",
    category: "Strategy Report",
    preview:
      "Bottom-up adoption remains the dominant GTM motion for developer tools in 2025. The most successful launches combine three channels: (1) a generous free tier that becomes the team's default before procurement notices, (2) content-led demand via technical blog posts that rank for high-intent queries, and (3) community seeding through OSS maintainers who amplify on X/Twitter. PLG converts best when the time-to-value is under 90 seconds.",
    price: 29,
    deliveredIn: "8 min",
  },
  {
    id: "s3",
    title: "Q3 SaaS Retention Benchmarks",
    category: "Data Analysis",
    preview:
      "Across 340 B2B SaaS companies analyzed, median net revenue retention fell to 108% in Q3 2025, down from 112% in Q2. The contraction is concentrated in the $1M–$10M ARR band, where expansion revenue has replaced logo growth as the primary growth driver. Churn remained flat at 3.2% monthly, but downsell (contraction) increased 40 bps. Companies with usage-based pricing showed 14pp higher NRR than seat-based peers.",
    price: 19,
    deliveredIn: "5 min",
  },
  {
    id: "s4",
    title: "Landing Page Copy: AI Agent Platform",
    category: "Copywriting",
    preview:
      "Stop hiring contractors for work an AI can do in minutes. Hermes Concierge delivers research, writing, and analysis — no humans, no delays, no equivocation. You write a brief. You pay once. You get the work. That's the entire model.💜 Built on NVIDIA's inference infrastructure. Secured by Stripe. Trusted by 200+ operators who'd rather ship than manage freelancers.",
    price: 15,
    deliveredIn: "4 min",
  },
  {
    id: "s5",
    title: "State of Open-Source LLMs — 2025 H2",
    category: "Research Brief",
    preview:
      "The open-source LLM landscape has matured significantly. Llama 4 Scout and Maverick now close the gap with proprietary models on most benchmarks, while Qwen 3 and DeepSeek V3 offer competitive performance at lower inference cost. The key trend: smaller, faster models (7B–14B) are becoming sufficient for 80% of production use cases, and the remaining 20% is where proprietary models still command a premium. Fine-tuning tooling has also improved dramatically — LoRA + quantization enables single-GPU specialization.",
    price: 9,
    deliveredIn: "4 min",
  },
];

export default function GalleryPage() {
  return (
    <div className="grid-bg min-h-screen">
      {/* Header */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-20">
        <div className="mb-2 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
          Gallery
        </div>
        <h1 className="mb-3 text-3xl font-bold text-[#f0f4ff]">
          See what the AI delivers
        </h1>
        <p className="max-w-xl text-sm text-[#8b9dc3]">
          Real deliverables from Hermes Concierge — anonymized, permission-based.
          Every sample below was generated autonomously by MiniMax M3 on NVIDIA NIM.
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLES.map((s) => (
            <article
              key={s.id}
              className="group flex h-full flex-col rounded-xl border border-[#1f1f1f] bg-[#111111] p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(124,58,237,0.15),0_8px_32px_rgba(0,0,0,0.4)]"
            >
              {/* Category badge */}
              <span className="mb-4 inline-flex w-fit items-center rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-[#7c3aed]">
                {s.category}
              </span>

              <h2 className="mb-3 text-base font-semibold leading-snug text-[#f0f4ff] group-hover:text-[#7c3aed] transition">
                {s.title}
              </h2>

              <p className="mb-6 flex-1 text-sm leading-relaxed text-[#8b9dc3]">
                {s.preview}…
              </p>

              <div className="flex items-center justify-between border-t border-[#1f1f1f] pt-4 text-xs text-[#4a5980]">
                <span>${s.price} · {s.deliveredIn} delivery</span>
                <span className="font-medium text-[#10b981]">✓ Delivered</span>
              </div>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-semibold text-[#f0f4ff]">
            Your brief could be here.
          </p>
          <Link
            href="/submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-[#7c3aed]/30 transition hover:bg-[#6d28d9]"
          >
            Submit a Brief →
          </Link>
        </div>
      </section>
    </div>
  );
}
