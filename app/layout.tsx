import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hermes-concierge-ten.vercel.app"),
  title: {
    default: "Hermes Concierge — Your work, done.",
    template: "%s · Hermes Concierge",
  },
  description:
    "AI-powered freelance agency. Submit a brief, pay once, receive your deliverable in minutes — fulfilled by MiniMax M3 on NVIDIA NIM. Zero humans involved.",
  applicationName: "Hermes Concierge",
  keywords: [
    "AI agency",
    "AI freelance",
    "MiniMax M3",
    "NVIDIA NIM",
    "Stripe checkout",
    "research brief",
    "copywriting AI",
  ],
  authors: [{ name: "Adnan Shaikh", url: "https://github.com/adnanshaikhhh" }],
  creator: "Hermes Concierge",
  publisher: "Hermes Concierge",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    title: "Hermes Concierge — Your work, done.",
    description:
      "Submit a brief, pay once, receive your deliverable in minutes — zero humans involved. Powered by MiniMax M3 on NVIDIA NIM.",
    url: "https://hermes-concierge-ten.vercel.app",
    siteName: "Hermes Concierge",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hermes Concierge — Your work, done.",
    description:
      "AI freelance agency. Submit brief → pay → receive deliverable. Zero humans.",
    creator: "@adnanshaikhhh",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans">
        <Navbar user={user ? { email: user.email ?? null } : null} />
        <main>{children}</main>
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid #1f1f1f",
              color: "#fafafa",
            },
          }}
        />
      </body>
    </html>
  );
}
