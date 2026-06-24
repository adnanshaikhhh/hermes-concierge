"use client";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-[#f0f4ff]">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-sm text-[#9fb0d0]">An unexpected error occurred. You can try again.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={() => unstable_retry()} className="rounded-md bg-[#3b6fe8] px-4 py-2 text-sm font-medium text-white">Try again</button>
        <Link href="/" className="rounded-md border border-[#1e2d4a] px-4 py-2 text-sm text-[#9fb0d0]">Home</Link>
      </div>
    </div>
  );
}