import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GalleryHorizontalEnd, LayoutDashboard, LogIn, LogOut } from "lucide-react";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="sticky top-0 z-50 border-b border-[#1e2d4a] bg-[#080b14]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#3b6fe8] to-[#8b5cf6]">
            <span className="text-sm font-bold text-white">H</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#f0f4ff]">
            Hermes Concierge
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden text-sm text-[#8b9dc3] hover:text-[#f0f4ff] sm:inline-block"
          >
            Services
          </Link>
          <Link
            href="/gallery"
            className="hidden items-center gap-1.5 text-sm text-[#8b9dc3] hover:text-[#f0f4ff] sm:inline-flex"
          >
            <GalleryHorizontalEnd className="h-4 w-4" />
            Gallery
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-sm text-[#8b9dc3] hover:text-[#f0f4ff]"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-sm text-[#8b9dc3] transition hover:bg-[#0e1420] hover:text-[#f0f4ff]"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#3b6fe8] px-3 text-sm font-medium text-white transition hover:bg-[#4a7ef0]"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
