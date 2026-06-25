import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://hermes-concierge-ten.vercel.app"),
  title: "Hermes Concierge — Your work, done.",
  description:
    "AI-powered delivery for research, writing, and analysis. Pay once, receive in minutes. Zero humans required.",
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Hermes Concierge — Your work, done.",
    description:
      "AI-powered delivery for research, writing, and analysis. Pay once, receive in minutes. Zero humans required.",
    url: "https://hermes-concierge-ten.vercel.app",
    siteName: "Hermes Concierge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hermes Concierge — Your work, done.",
    description:
      "AI-powered delivery for research, writing, and analysis. Zero humans required.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <Navbar />
        <main>{children}</main>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#0e1420",
              border: "1px solid #1e2d4a",
              color: "#f0f4ff",
            },
          }}
        />
      </body>
    </html>
  );
}
