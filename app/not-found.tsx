import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium text-[#3b6fe8]">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-[#f0f4ff]">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-[#9fb0d0]">That page doesn&apos;t exist. It may have moved, or the link is incorrect.</p>
      <Link href="/" className="mt-6 rounded-md bg-[#3b6fe8] px-4 py-2 text-sm font-medium text-white">Back to home →</Link>
    </div>
  );
}