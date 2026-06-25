import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/webhooks (Stripe webhooks - must be unauthenticated)
     * - api/cron (cron jobs - auth via Bearer token)
     * - auth (auth callback)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
