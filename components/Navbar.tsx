"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/submit", label: "Submit Brief" },
  { href: "/gallery", label: "Gallery" },
  { href: "/dashboard", label: "Orders" },
];

type Props = {
  user?: { email?: string | null } | null;
};

export function Navbar({ user }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-colors duration-200 ${
          scrolled
            ? "border-b border-[#1f1f1f] bg-[#0a0a0a]/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent backdrop-blur-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#7c3aed] to-[#a855f7]">
              <span className="text-sm font-bold text-white">⚡</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              <span className="text-[#7c3aed]">Hermes</span>
              <span className="text-[#fafafa]"> Concierge</span>
            </span>
          </Link>

          {/* Center nav (desktop) */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#1f1f1f] text-[#fafafa]"
                      : "text-[#a1a1aa] hover:bg-[#161616] hover:text-[#fafafa]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right CTA (desktop) */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <span className="text-xs text-[#71717a]">{user.email}</span>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-[#a1a1aa] transition hover:text-[#fafafa]"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/submit"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#7c3aed] px-4 text-sm font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition hover:bg-[#6d28d9]"
            >
              Submit Brief →
            </Link>
          </div>

          {/* Hamburger (mobile) */}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#1f1f1f] bg-[#111111] md:hidden"
          >
            <Menu className="h-4 w-4 text-[#fafafa]" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[#0a0a0a] md:hidden">
          <div className="flex h-16 items-center justify-between border-b border-[#1f1f1f] px-6">
            <span className="text-sm font-semibold">
              <span className="text-[#7c3aed]">Hermes</span>
              <span className="text-[#fafafa]"> Concierge</span>
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#1f1f1f]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-2 p-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg border border-[#1f1f1f] bg-[#111111] px-4 py-3 text-base font-medium text-[#fafafa] transition hover:border-[#7c3aed]/40"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/submit"
              className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#7c3aed] px-6 text-base font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              Submit Brief →
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#1f1f1f] px-6 text-base font-medium text-[#a1a1aa]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
