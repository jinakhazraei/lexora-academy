import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_COOKIE,
  defaultLocale,
  hasLocale,
  matchAcceptLanguage,
  splitLocale,
} from "@/i18n/config";
import { needsSession, updateSession } from "@/lib/supabase/proxy";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { lang, rest } = splitLocale(pathname);

  // No language in the address: use the one they picked before, else their browser's, else English.
  if (!lang) {
    const saved = request.cookies.get(LOCALE_COOKIE)?.value;
    const chosen = hasLocale(saved) ? saved : (matchAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale);
    const url = request.nextUrl.clone();
    url.pathname = `/${chosen}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const response = needsSession(rest) ? await updateSession(request, lang, rest) : NextResponse.next();

  // Remember the language, so addresses without one come back to it.
  if (request.cookies.get(LOCALE_COOKIE)?.value !== lang) {
    response.cookies.set(LOCALE_COOKIE, lang, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
  }
  return response;
}

export const config = {
  // Everything except API routes, the auth callback, Next.js internals and files (anything with a dot).
  matcher: ["/((?!api|auth/callback|_next|images|video|.*\\..*).*)"],
};
