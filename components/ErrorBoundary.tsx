"use client";

import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

/**
 * Generic client-side error boundary.
 *
 * App Router uses /error.tsx files for per-route boundaries automatically,
 * but this component is useful for embedding inside client trees where
 * one component failing shouldn't kill the whole page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev; in prod consider piping to /api/log
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary] caught:", error, info);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-[200px] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/5 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 h-8 w-8 text-[#ef4444]" />
            <h2 className="mb-1 text-base font-semibold text-[#fafafa]">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-[#a1a1aa]">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#ef4444]/30 px-3 text-xs font-medium text-[#ef4444] transition hover:bg-[#ef4444]/10"
            >
              <RefreshCcw className="h-3 w-3" /> Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
