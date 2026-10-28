import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

// Only the pages that use accounts — the marketing pages stay static and fast.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account",
    "/account/:path*",
    "/writing/:path*",
    "/teacher/:path*",
    "/login",
    "/signup",
    "/reset-password",
    "/api/writing/:path*",
  ],
};
