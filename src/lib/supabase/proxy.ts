import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Locale } from "@/i18n/config";
import { isSupabaseConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

/** Pages (after the language) that need a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard", "/account", "/writing/history", "/teacher"];

/** Pages that read the session on the server, so the session cookie is refreshed for them. */
const SESSION_PREFIXES = [...PROTECTED_PREFIXES, "/writing", "/login", "/signup", "/reset-password"];

const matches = (path: string, prefixes: string[]) => prefixes.some((p) => path === p || path.startsWith(`${p}/`));

export function needsSession(rest: string) {
  return matches(rest, SESSION_PREFIXES);
}

/**
 * Refreshes the Supabase session cookie and sends signed-out visitors on protected pages
 * to the login page in their language. Pages still check the user themselves.
 * `rest` is the path after the language, e.g. "/dashboard".
 */
export async function updateSession(request: NextRequest, lang: Locale, rest: string) {
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

  if (matches(rest, PROTECTED_PREFIXES) && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = `/${lang}/login`;
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    ["cache-control", "expires", "pragma"].forEach((h) => {
      const v = response.headers.get(h);
      if (v) redirect.headers.set(h, v);
    });
    return redirect;
  }

  return response;
}
