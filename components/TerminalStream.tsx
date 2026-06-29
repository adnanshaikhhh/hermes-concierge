"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";

type LogEntry = {
  ts: string;
  text: string;
  level: "info" | "ok" | "process" | "warn" | "done";
};

function nowHHMMSS() {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

function tsColor(level: LogEntry["level"]) {
  switch (level) {
    case "ok":
      return "text-[#10b981]";
    case "process":
      return "text-[#7c3aed]";
    case "warn":
      return "text-[#f59e0b]";
    case "done":
      return "text-[#10b981] font-bold";
    default:
      return "text-[#a1a1aa]";
  }
}

const SCRIPTED_LOG: Omit<LogEntry, "ts">[] = [
  { level: "ok", text: '✓ Order received and verified' },
  { level: "ok", text: '✓ Stripe payment captured' },
  { level: "info", text: '→ Brief analyzed — 847 tokens extracted' },
  { level: "process", text: '→ Connecting to MiniMax M3 via NVIDIA NIM...' },
  { level: "process", text: '→ Generating your deliverable...' },
  { level: "process", text: '→ Running quality control pass...' },
  { level: "ok", text: '✓ Complete — preparing result...' },
];

type StatusResp =
  | { type: "status"; status: string; result_url?: string | null }
  | { type: "error" };

export default function TerminalStream({
  orderId,
  initiallyDone = false,
}: {
  orderId: string;
  initiallyDone?: boolean;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phase, setPhase] = useState<
    "init" | "streaming" | "delivered" | "failed"
  >(initiallyDone ? "delivered" : "init");
  const [bouncing, setBouncing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Stream the scripted logs one by one for cinematic effect
  useEffect(() => {
    if (initiallyDone) {
      setLogs(
        SCRIPTED_LOG.map((l) => ({ ...l, ts: nowHHMMSS() })),
      );
      setPhase("delivered");
      return;
    }

    setPhase("streaming");

    let cancelled = false;
    let i = 0;
    function pushNext() {
      if (cancelled) return;
      if (i >= SCRIPTED_LOG.length) {
        // Wait, then poll the real status
        setTimeout(() => {
          pollStatus();
        }, 900);
        return;
      }
      const entry = SCRIPTED_LOG[i];
      setLogs((prev) => [...prev, { ...entry, ts: nowHHMMSS() }]);
      i += 1;
      setTimeout(pushNext, 700 + Math.random() * 400);
    }
    setTimeout(pushNext, 250);

    return () => {
      cancelled = true;
    };
  }, [orderId, initiallyDone]);

  function pollStatus() {
    let cancelled = false;
    let attempt = 0;
    const tick = async () => {
      if (cancelled) return;
      attempt += 1;
      try {
        const res = await fetch(`/api/fulfill/${orderId}/status`, {
          cache: "no-store",
        });
        const data: StatusResp = await res.json();
        if (data.type === "status") {
          if (data.status === "complete") {
            setLogs((prev) => [
              ...prev,
              { ts: nowHHMMSS(), level: "done", text: "✓ DELIVERABLE READY" },
            ]);
            setResultUrl(data.result_url ?? null);
            setPhase("delivered");
            setBouncing(true);
            setTimeout(() => setBouncing(false), 1500);
            return;
          }
          if (data.status === "failed") {
            setLogs((prev) => [
              ...prev,
              {
                ts: nowHHMMSS(),
                level: "warn",
                text: "✗ Generation stopped — contact support",
              },
            ]);
            setPhase("failed");
            return;
          }
        }
      } catch {
        // Silent retry
      }
      if (attempt < 60) setTimeout(tick, 5000);
    };
    tick();
    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#1f1f1f] bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(124,58,237,0.1),0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-[#1f1f1f] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
          <span className="ml-3 font-mono text-xs text-[#71717a]">
            hermes@concierge:~ — server log
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#71717a]">
          {phase === "delivered" ? "READY" : "LIVE"}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-5 sm:px-6">
        <p className="mb-4 text-xs font-medium uppercase tracking-widest text-[#7c3aed]">
          Your AI is working…
        </p>

        <div className="min-h-[260px] font-mono text-[13px] leading-relaxed">
          {logs.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-baseline gap-3 fade-in"
              style={{ animationDelay: `${Math.min(idx * 40, 200)}ms` }}
            >
              <span className="select-none text-[#52525b]">[{entry.ts}]</span>
              <span className={tsColor(entry.level)}>{entry.text}</span>
            </div>
          ))}
          {phase === "streaming" && (
            <div className="mt-1 flex items-baseline gap-3 font-mono text-[13px]">
              <span className="select-none text-[#52525b]">
                [{nowHHMMSS()}]
              </span>
              <span className="text-[#7c3aed]">
                working
                <span className="blink-cursor">▌</span>
              </span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Delivered banner */}
        {phase === "delivered" && (
          <div
            className={`mt-6 rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-3 ${
              bouncing ? "animate-bounce" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-[#10b981]">
              <CheckCircle2 className="h-4 w-4" />
              ✓ DELIVERABLE READY
            </div>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              Your brief is complete. Open the full order to view the
              deliverable.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={`/order/detail/${orderId}`}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#10b981] px-3 text-xs font-semibold text-white transition hover:bg-[#059669]"
              >
                <Download className="h-3.5 w-3.5" /> Open deliverable
              </a>
              {resultUrl && (
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#10b981]/30 px-3 text-xs font-medium text-[#10b981] transition hover:bg-[#10b981]/10"
                >
                  Direct link →
                </a>
              )}
            </div>
          </div>
        )}

        {phase === "failed" && (
          <div className="mt-6 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm font-medium text-[#ef4444]">
            Order failed. Please contact support.
          </div>
        )}
      </div>
    </div>
  );
}
