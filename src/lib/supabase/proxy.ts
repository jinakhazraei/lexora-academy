import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

/** Paths that need a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/writing/history", "/teacher"];

/**
 * Refreshes the Supabase session cookie on every matched request and sends
 * signed-out visitors on protected pages to the login page.
 * Pages still check the user themselves — this is only the first line.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Don't put code between createServerClient and getClaims: it refreshes the session.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    const redirect = NextResponse.redirect(url);
    // Carry over any refreshed cookies and their no-cache headers.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    ["cache-control", "expires", "pragma"].forEach((h) => {
      const v = response.headers.get(h);
      if (v) redirect.headers.set(h, v);
    });
    return redirect;
  }

  return response;
}
