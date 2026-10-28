"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

type I18nValue = { lang: Locale; t: Dictionary };

const I18nContext = createContext<I18nValue | null>(null);

/**
 * Gives Client Components the language and its dictionary. The server layout passes the
 * dictionary in, so the browser only downloads the current language.
 * The teacher area nests a second provider with English; links still keep the URL's
 * language because LocaleLink reads it from the URL, not from here.
 */
export function I18nProvider({ lang, t, children }: I18nValue & { children: React.ReactNode }) {
  return <I18nContext.Provider value={{ lang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>.");
  return value;
}
