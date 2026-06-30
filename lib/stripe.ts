import Stripe from "stripe";

// Single pinned Stripe client. Imported by app/api/checkout and any
// other route that needs to talk to Stripe. The webhook handler must
// NOT use this client — it constructs its own with the raw body for
// signature verification.
const apiKey = process.env.STRIPE_SECRET_KEY || "";
export const stripe = new Stripe(apiKey, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
  appInfo: {
    name: "hermes-concierge",
    version: "1.0.0",
  },
});
