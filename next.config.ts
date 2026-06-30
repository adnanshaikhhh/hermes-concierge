import type { NextConfig } from "next";

// Production env guards — fail build loud if critical env vars are missing.
// Only enforced when deploying to Vercel production; local builds pass.
if (process.env.VERCEL_ENV === "production") {
  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NVIDIA_API_KEY",
    "CRON_SECRET",
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `❌ PRODUCTION BUILD FAILED — missing required env vars: ${missing.join(", ")}. Set them in your Vercel Production environment settings.`
    );
  }
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
