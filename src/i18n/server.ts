import { notFound } from "next/navigation";
import { lang as rootLang } from "next/root-params";
import { hasLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

/** The current page's language, from the /[lang] segment. Server Components only. */
export async function getLang(): Promise<Locale> {
  const value = await rootLang();
  if (!hasLocale(value)) notFound();
  return value;
}

/** The current language and its dictionary. Server Components only. */
export async function getI18n() {
  const lang = await getLang();
  return { lang, t: getDictionary(lang) };
}
