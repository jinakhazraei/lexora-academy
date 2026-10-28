import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lexora-academy-institute.online").replace(/\/$/, "");

/** canonical + hreflang links, so search engines show each visitor the right language. */
export function languageAlternates(lang: Locale, path: string): Metadata["alternates"] {
  const suffix = path === "/" ? "" : path;
  return {
    canonical: `${SITE}/${lang}${suffix}`,
    languages: {
      ...Object.fromEntries(locales.map((l) => [l, `${SITE}/${l}${suffix}`])),
      "x-default": `${SITE}/en${suffix}`,
    },
  };
}
