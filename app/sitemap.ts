import type { MetadataRoute } from "next";

const SITE = "https://hermes-concierge-ten.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: `${SITE}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}/submit`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE}/gallery`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE}/dashboard`, lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];
}
