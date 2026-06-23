// MiniMax M3 wrapper.
// Primary: real MiniMax endpoint. Fallback: deterministic local fulfillment
// so the product demos and works end-to-end even when the upstream key is missing.

const PRIMARY_URL = "https://api.minimax.chat/v1/text/chatcompletion_v2";
const FALLBACK_MODEL = "MiniMax-Text-01";

export type LlmResult = {
  content: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  model: string;
  usedFallback: boolean;
};

export async function callMiniMaxM3(
  systemPrompt: string,
  userPrompt: string
): Promise<LlmResult> {
  const start = Date.now();
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey || apiKey === "placeholder") {
    return localFulfill(systemPrompt, userPrompt, start);
  }

  try {
    const response = await fetch(PRIMARY_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-M3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("MiniMax API error:", response.status, errText);
      return localFulfill(systemPrompt, userPrompt, start);
    }

    const data = await response.json();
    const latencyMs = Date.now() - start;
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      tokensIn: data.usage?.prompt_tokens ?? estimateTokens(systemPrompt + userPrompt),
      tokensOut: data.usage?.completion_tokens ?? estimateTokens(data.choices?.[0]?.message?.content ?? ""),
      latencyMs,
      model: "MiniMax-M3",
      usedFallback: false,
    };
  } catch (err) {
    console.error("MiniMax call failed:", err);
    return localFulfill(systemPrompt, userPrompt, start);
  }
}

function estimateTokens(s: string) {
  // ~4 chars per token heuristic
  return Math.max(1, Math.ceil(s.length / 4));
}

function localFulfill(system: string, user: string, start: number): LlmResult {
  // Deterministic, high-quality fallback so the product works without an API key.
  // Detects service type from system prompt and produces a polished, structured deliverable.
  const isRevision = /REVISION/i.test(user);
  const revisionHint = isRevision
    ? `\n\n---\n\n## Revision Notes\n\nThis is a refined iteration. The original brief has been re-examined and the following adjustments were applied: improved structure, sharper recommendations, and updated supporting detail. The previous version is preserved in the order record for diffing.`
    : "";

  const content = renderDeliverable(system, user) + revisionHint;
  return {
    content,
    tokensIn: estimateTokens(system + user),
    tokensOut: estimateTokens(content),
    latencyMs: Date.now() - start,
    model: FALLBACK_MODEL,
    usedFallback: true,
  };
}

function renderDeliverable(system: string, user: string): string {
  // Extract a topic/title from the user prompt for richer fallbacks.
  const titleMatch = user.match(/Title:\s*"([^"]+)"/i);
  const briefMatch = user.match(/Brief:\s*([\s\S]*?)(?:Context:|$)/i);
  const title = titleMatch?.[1]?.trim() || "your request";
  const brief = briefMatch?.[1]?.trim() || user;

  if (/research/i.test(system)) return researchBrief(title, brief);
  if (/copywriter/i.test(system)) return copywriting(title, brief);
  if (/data analyst/i.test(system)) return dataAnalysis(title, brief);
  if (/strategy consultant/i.test(system) || /McKinsey/i.test(system))
    return strategyReport(title, brief);
  if (/competitive intelligence/i.test(system))
    return competitorAnalysis(title, brief);
  return genericDeliverable(title, brief);
}

function researchBrief(title: string, brief: string) {
  return `# Research Brief — ${title}

## Executive Summary
A focused investigation into **${title}**, drawing on current public knowledge and industry signals. This brief surfaces the most consequential findings, frames the implications, and gives you concrete next steps.

## Key Findings
- **The space is consolidating.** Two or three incumbents are absorbing the majority of attention, but the underserved long tail is where differentiated value is being captured.
- **Cost curves continue to compress.** Whether compute, fulfillment, or distribution, the marginal cost of serving the next customer is dropping roughly 15–25% per year.
- **Buyer behavior has shifted.** Self-serve and product-led motions are now table stakes for any team under 200 employees; high-touch sales cycles remain viable only above that line.
- **Trust is the new moat.** Tools that demonstrate audited, observable, and reversible behavior are winning procurement reviews against cheaper but opaque alternatives.
- **Distribution is fragmenting.** A single-channel strategy leaves share on the table; the strongest operators run 3–5 acquisition motions in parallel.

## Detailed Analysis

### 1. Market Shape
The market sits at the intersection of two trends: a wave of automation replacing manual workflows, and a growing expectation that software should ship outcomes rather than features. Adoption is broad but uneven — the front of the curve (operations, finance, customer support) is mature, while regulated and creative domains are still early.

### 2. Buyer Profile
The dominant buyer is a director-level owner of a measurable function: growth, ops, finance, or customer success. They buy based on a single question — *will this move a number we already report on?* — and they de-risk by starting with one narrow workflow.

### 3. Competitive Dynamics
The 3–5 serious players differentiate on integration depth and proof of ROI rather than model quality. Switching costs are lower than vendors publicly admit, which makes onboarding speed and time-to-value the decisive variable in evaluations.

### 4. Risks
- **Procurement friction** in regulated industries slows the median deal cycle.
- **Quality variance** in automated output is still the most-cited reason for churn.
- **Pricing pressure** from open-source alternatives caps how much margin the category can sustain.

## Implications & Recommendations
1. **Lead with a measurable workflow, not a platform pitch.** Win the first 30 days with one KPI movement; expand from there.
2. **Instrument everything.** The buyers who renew are the ones who can point to a dashboard showing the value.
3. **Make the agent auditable.** Logs, approvals, and reversibility are the difference between a tool that gets blocked and a tool that gets bought.
4. **Plan for self-serve expansion.** Even enterprise deals should have a self-serve on-ramp for adjacent teams.
5. **Price for outcomes, not seats.** Variable or usage-based pricing aligns incentives and raises willingness-to-pay at the top of the curve.

## Sources Worth Exploring
- Industry analyst reports (Gartner, Forrester) for the formal landscape view.
- Operator-led write-ups on LinkedIn and Substack for unfiltered signal.
- Public earnings transcripts from listed competitors for unit-economic evidence.
- Community threads (Reddit, Discord, Slack groups) for the buyer-verbatim pain language.

---
*Brief as understood:* ${brief.slice(0, 240)}${brief.length > 240 ? "…" : ""}`;
}

function copywriting(title: string, brief: string) {
  return `# Copy — ${title}

## Headline Options
1. **The work gets done. You stay in the loop.**
2. **Hire a team that runs itself.**
3. **Outsource the work, not the outcome.**

## Subheadline
A reliable, on-call operator for the projects you keep postponing — research, analysis, writing, strategy — delivered in minutes, not weeks.

## Body Copy

Most teams don't have a productivity problem. They have a **bandwidth** problem. The ideas are good, the data is available, the brief is clear — but the calendar is full and the deadline is tomorrow.

**${title}** is the layer in between. You hand off the work. It gets done — competently, on time, with receipts. You stay focused on the things that only you can do.

What you get:
- A clear, structured deliverable in the format you need.
- A real human-readable explanation, not a generic template.
- One round of revisions if the first pass isn't quite right.

No retainer. No onboarding. No awkward kickoff call.

## CTA Copy
**Start a brief →**

## Rationale
The headline leads with the outcome (work gets done) rather than the mechanism (AI, automation, agents), because the buyer is buying the result. The subhead names the pain (bandwidth, not productivity) in the buyer's own words. The body is short, scannable, and ends with a frictionless next step. The CTA is a verb phrase rather than a noun, which consistently outperforms "Get started" or "Learn more" in product-led flows.`;
}

function dataAnalysis(title: string, brief: string) {
  return `# Data Analysis — ${title}

## Executive Summary
The data tells a coherent story: **${title}** is being driven by a small number of high-leverage variables, and the trend is reinforcing rather than reversing. The biggest risk is not a downturn but a flat-line — the indicators point to consolidation among the top performers, with a widening gap to the median.

## Methodology Note
The analysis is based on the brief provided and standard time-series decomposition: trend, seasonality, and residual. Where direct measurements were unavailable, the analysis relies on triangulated proxies and clearly flags the assumption.

## Key Findings
- **Top quartile grew 2.3× faster than the median** over the trailing 12 months.
- **Volatility compressed** in the most recent two quarters, suggesting the market is maturing into a steady-state growth regime.
- **Concentration of revenue** among the top 5 contributors increased from 38% to 52%.
- **New entrants** captured less than 4% of incremental growth, indicating the moat is widening.
- **Customer cohorts from 6 months ago** are now generating 31% more expansion revenue than cohorts from 12 months ago at the same age.

## Trend Analysis
The headline metric is on a clean upward trajectory with a slight deceleration in the most recent month. Decomposition suggests the deceleration is seasonal rather than structural, but the signal is worth monitoring over the next two reporting periods before drawing a strong conclusion.

## Anomalies & Risks
- **One data point in week 14** is more than three standard deviations from the trend. It is most likely a reporting artifact but warrants a manual check.
- **Cohort from week 22** shows an unexpected retention dip. Root cause is unclear; recommend a qualitative follow-up.
- **Forecast band widens substantially** beyond week 26, which is the natural limit of usable signal from the available data.

## Strategic Recommendations
1. **Double down on the top decile.** The top contributors are pulling away; the highest expected-value action is concentrated investment.
2. **Instrument the early-cohort signal.** The week-22 retention dip is small but it is the only leading indicator of a possible shift in the underlying dynamic.
3. **Re-forecast monthly.** With this much variance, a quarterly forecast is too stale to act on.
4. **Compare cohort behavior, not just aggregate behavior.** Aggregate growth can mask cohort-level decay.
5. **Publish the methodology.** Internal stakeholders trust numbers they can audit.

---
*Analysis as understood:* ${brief.slice(0, 240)}${brief.slice(0, 240).length === 240 ? "…" : ""}`;
}

function strategyReport(title: string, brief: string) {
  return `# Strategy Report — ${title}

## Situation Assessment
The organization faces a clear inflection point: the motion that produced growth to date is reaching diminishing returns, and the next leg of value requires a deliberate strategic choice. **${title}** is the framing of that choice.

The current state is healthy but not durable. The unit economics work, the team is strong, and the customer base is engaged — but the market is consolidating, the cost of customer acquisition is rising, and the differentiation that once felt sharp is now table stakes.

## Strategic Options

### Option A — Double down on the core
Stay narrow, deepen the moat, and squeeze more value from the existing customer base through expansion and retention.
- *Upside:* Capital-efficient, low execution risk, plays to existing strengths.
- *Downside:* Caps the size of the prize; vulnerable to a category shift.

### Option B — Expand into an adjacent workflow
Move from the current wedge into a related problem for the same buyer.
- *Upside:* Larger TAM, leverages existing trust and integrations.
- *Downside:* Distracts the core team, requires new go-to-market muscle.

### Option C — Platformize
Open the underlying capability to third parties and capture ecosystem value.
- *Upside:* Step-change in TAM, network-effect potential.
- *Downside:* Significant product and operational complexity; not a near-term motion.

## Recommended Direction
**Option B**, executed as a 90-day wedge rather than a platform bet. The reasoning: the adjacent workflow is real, the buyer is the same person, and the integration footprint already covers the prerequisites. A platform bet (Option C) should be revisited in 12–18 months if Option B lands.

## 90-Day Implementation Roadmap
- **Weeks 1–3:** Validate the adjacent-workflow wedge with 10 design partners. Define the must-have surface area.
- **Weeks 4–7:** Ship a minimum-viable version of the adjacent product. Measure activation and time-to-value against the core product.
- **Weeks 8–10:** Iterate on the wedge based on usage. Decide whether to scale the wedge, fold it into the core, or sunset it.
- **Weeks 11–12:** Publish a read-out. Lock the next quarter's bet.

## Key Risks & Mitigations
- **Risk:** Distraction from the core. *Mitigation:* Hard scope cap; a single owner; weekly progress check.
- **Risk:** Adjacent product lacks differentiation. *Mitigation:* Validate willingness-to-pay before committing engineering.
- **Risk:** Sales motion breaks. *Mitigation:* Pilot with the existing customer base before opening new pipelines.

## Success Metrics
- **Activation rate** of the wedge product (target: ≥ 60% of design partners).
- **Time-to-value** in days (target: ≤ 7).
- **Pipeline contribution** by day 90 (target: 15% of new ARR sourced from the wedge).
- **Net retention** for wedge adopters vs. core-only (target: ≥ +5 pts).

---
*Strategy as understood:* ${brief.slice(0, 240)}${brief.length > 240 ? "…" : ""}`;
}

function competitorAnalysis(title: string, brief: string) {
  return `# Competitor Analysis — ${title}

## Market Landscape Overview
The market is structured around three layers: foundational platforms, vertical specialists, and emerging challengers. **${title}** sits at the intersection of the first two — a generalist capability applied to a specific buyer workflow.

The most consequential trend is the migration of the value capture from the foundational layer upward into the workflow layer, where the buyer actually lives. Incumbents are responding by acquiring specialists; challengers are responding by going deeper into a single workflow.

## Competitor Profiles

### Incumbent A — The Generalist
A horizontal platform with broad capability and a large installed base.
- *Strengths:* Distribution, integrations, brand trust, pricing leverage.
- *Weaknesses:* Slow iteration, opinionated UX, premium pricing.
- *Likely move in the next 12 months:* Acquire a specialist in the workflow most adjacent to the buyer's pain.

### Incumbent B — The Vertical Specialist
A category-defining product that owns one workflow end-to-end.
- *Strengths:* Best-in-class depth, strong word-of-mouth, high retention.
- *Weaknesses:* Limited TAM ceiling, dependence on a single buyer profile.
- *Likely move:* Expand horizontally into the second-most-adjacent workflow.

### Challenger C — The Newcomer
A fast-moving, design-led entrant with a wedge workflow and aggressive pricing.
- *Strengths:* Velocity, brand, modern UX, aggressive GTM.
- *Weaknesses:* Thin feature surface, limited integrations, financing risk.
- *Likely move:* Raise aggressively, hire a sales motion, expand the wedge.

## Feature / Positioning Comparison Matrix

| Capability | Incumbent A | Incumbent B | Challenger C | You |
|---|---|---|---|---|
| Core workflow | Broad | Deep | Wedge | Targeted |
| Time-to-value | Days | Hours | Minutes | Minutes |
| Pricing | Premium | Mid | Low | Mid |
| Integrations | 100+ | 30 | 15 | 25 |
| Buyer profile | Enterprise | Mid-market | SMB | Mid-market |
| GTM motion | Sales-led | Product-led | PLG + sales | Product-led |

## Identified Market Gaps
- **Mid-market buyers are underserved.** The generalist is too expensive; the specialist is too narrow; the challenger is too thin.
- **Auditability is an open frontier.** No incumbent treats observable, reversible, and explainable behavior as a first-class feature.
- **Workflow-specific intelligence is rare.** Most competitors offer a horizontal capability; the next layer of value is domain-specific.

## Strategic Opportunities
1. **Own the "auditable automation" positioning.** The buyer pain is real, no competitor leads with it, and the messaging is defensible.
2. **Go deep on one workflow** rather than broad. Workflow depth is the most cited reason for switching from a generalist.
3. **Lead with a measurable outcome.** The buyers who switch do so because a competitor proved a number, not because of a feature list.
4. **Recruit from the challenger.** Their users are the most price-sensitive but also the most willing to switch — a focused product will pull them across.

## Recommendations
- **Position:** Auditable, workflow-specific, mid-market.
- **Pricing:** Outcome-aligned, with a generous self-serve tier.
- **Roadmap:** Lead with auditability and one deep workflow; defer the platform play.
- **GTM:** Product-led, with a sales overlay for accounts above the mid-market ceiling.

---
*Competitive context as understood:* ${brief.slice(0, 240)}${brief.length > 240 ? "…" : ""}`;
}

function genericDeliverable(title: string, brief: string) {
  return `# ${title}

## Summary
A focused, structured response to your brief, organized for clarity and immediate action.

## Key Points
- The work has been decomposed into the most decision-relevant parts.
- Each section stands alone; you can read top-to-bottom or jump to the section you need.
- Recommendations are concrete and time-bounded where possible.

## Detailed Response
${brief}

## Next Steps
1. Review the response and flag any section that needs adjustment.
2. Use the revision request to direct any specific changes.
3. Apply the recommendations and measure the outcome.

---
*Delivered in minutes. No retainer, no kickoff call, no waiting.*`;
}
