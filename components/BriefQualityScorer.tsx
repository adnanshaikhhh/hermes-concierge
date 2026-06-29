"use client";

import { useMemo } from "react";

type Dimension = {
  key: string;
  label: string;
  desc: string;
  score: number; // 0–100
};

function score(brief: string): Dimension[] {
  const len = brief.length;
  const words = brief.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Specificity — mentions concrete things (numbers, names, proper nouns, quoted phrases)
  const specifics = (
    brief.match(/\d+/g) || []
  ).length + (brief.match(/[A-Z][a-z]+[A-Z]/g) || []).length + (brief.match(/["']/g) || []).length / 2;
  const specificity = Math.min(100, Math.round(specifics * 15 + (wordCount > 40 ? 20 : wordCount * 0.5)));

  // 2. Verifiability — asks for citations, sources, data points
  const verifyKeywords = ["source", "cite", "reference", "citation", "data", "statistic", "study", "report", "benchmark", "metric"];
  const verifyHits = verifyKeywords.filter((k) => brief.toLowerCase().includes(k)).length;
  const verifiability = Math.min(100, Math.round(verifyHits * 25 + (wordCount > 80 ? 15 : 0)));

  // 3. Completeness — length-based with diminishing returns
  const completeness = Math.min(100, Math.round(Math.log2(Math.max(1, len)) * 12));

  // 4. Structuredness — lists, headings, line breaks, sections
  const structureSignals = (brief.match(/\n/g) || []).length + (brief.match(/[-•▪▸→]/g) || []).length + (brief.match(/\d\./g) || []).length;
  const structuredness = Math.min(100, Math.round(structureSignals * 12 + (len > 300 ? 15 : 0)));

  return [
    { key: "specificity", label: "Specificity", desc: "Concrete details, numbers, examples", score: specificity },
    { key: "verifiability", label: "Verifiability", desc: "Asks for sources, citations, data", score: verifiability },
    { key: "completeness", label: "Completeness", desc: "Sufficient length and depth", score: completeness },
    { key: "structuredness", label: "Structuredness", desc: "Lists, headings, clear sections", score: structuredness },
  ];
}

function colorFor(score: number): string {
  if (score >= 70) return "#10b981"; // green
  if (score >= 40) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export default function BriefQualityScorer({ brief }: { brief: string }) {
  const dimensions = useMemo(() => score(brief), [brief]);
  const overall = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  if (brief.length < 20) return null; // Don't show for very short text

  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
          Brief Quality
        </p>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: colorFor(overall) }}
        >
          {overall}
        </span>
      </div>

      <div className="space-y-3">
        {dimensions.map((d) => (
          <div key={d.key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-[#f0f4ff]">{d.label}</span>
              <span className="text-xs tabular-nums text-[#4a5980]" title={d.desc}>
                {d.score}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#1f1f1f]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${d.score}%`,
                  backgroundColor: colorFor(d.score),
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {overall < 40 && (
        <p className="mt-3 text-xs text-[#8b9dc3]">
          💡 Add specific details, request sources, or structure with headings and lists to improve your brief.
        </p>
      )}
    </div>
  );
}
