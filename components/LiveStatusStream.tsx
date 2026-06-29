"use client";

import { useEffect, useState } from "react";

type Step = { key: string; label: string; icon: string };

export default function LiveStatusStream({ orderId }: { orderId: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [stepIndex, setStepIndex] = useState(-1);
  const [done, setDone] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  useEffect(() => {
    const es = new EventSource(`/api/fulfill/${orderId}/stream`);

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "steps") {
          setSteps(data.steps);
        } else if (data.type === "status") {
          setCurrentStep(data.currentStep);
          setStepIndex(data.stepIndex);
          if (data.resultUrl) setResultUrl(data.resultUrl);
        } else if (data.type === "done") {
          setDone(true);
          es.close();
        }
      } catch {
        // Ignore malformed messages
      }
    };

    es.onerror = () => {
      // Reconnect is handled automatically by EventSource
      // Close after 5 minutes of errors to avoid infinite retry
      const timeout = setTimeout(() => es.close(), 300_000);
      return () => clearTimeout(timeout);
    };

    return () => es.close();
  }, [orderId]);

  if (steps.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#4a5980]">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        Connecting to agent…
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#0a0a0a] p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
        Live AI Status
      </p>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const isActive = i === stepIndex;
          const isCompleted = i < stepIndex;
          const isPending = i > stepIndex;

          return (
            <div key={step.key} className="flex items-center gap-3">
              {/* Status dot */}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs transition-all duration-500 ${
                  isCompleted
                    ? "border border-[#10b981] bg-[#10b981]/10 text-[#10b981]"
                    : isActive
                      ? "border border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]"
                      : "border border-[#1f1f1f] bg-[#111111] text-[#4a5980]"
                }`}
              >
                {isCompleted ? (
                  "✓"
                ) : isActive && !done ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7c3aed] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7c3aed]" />
                  </span>
                ) : (
                  <span className="opacity-40">{step.icon}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-sm transition-colors duration-300 ${
                  isCompleted
                    ? "font-medium text-[#10b981]"
                    : isActive
                      ? "font-medium text-[#f0f4ff]"
                      : "text-[#4a5980]"
                }`}
              >
                {step.label}
              </span>

              {/* Active indicator */}
              {isActive && !done && (
                <span className="text-xs text-[#7c3aed]">— working…</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Result link */}
      {done && resultUrl && (
        <div className="mt-4 border-t border-[#1f1f1f] pt-3">
          <a
            href={resultUrl}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]"
          >
            View Deliverable →
          </a>
        </div>
      )}
    </div>
  );
}
