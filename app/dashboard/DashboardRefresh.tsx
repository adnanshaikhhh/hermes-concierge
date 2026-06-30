"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function DashboardRefresh() {
  const router = useRouter();
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setSecondsAgo((s) => s + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  // Auto-refresh every 60s
  useEffect(() => {
    const refresh = setInterval(() => {
      router.refresh();
      setSecondsAgo(0);
    }, 60_000);
    return () => clearInterval(refresh);
  }, [router]);

  return (
    <div className="flex items-center gap-2 text-xs text-[#71717a]">
      <RefreshCw className="h-3 w-3" />
      <span>
        Last updated {secondsAgo < 5 ? "just now" : `${secondsAgo}s ago`}
      </span>
    </div>
  );
}
