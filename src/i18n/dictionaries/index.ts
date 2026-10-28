import type { Locale } from "@/i18n/config";
import en from "./en";
import hy from "./hy";
import ru from "./ru";

export type { Dictionary, PolicySection } from "./en";

// Small enough to bundle statically: avoids async loading in client components.
const dictionaries = { en, hy, ru } as const;

export function getDictionary(lang: Locale) {
  return dictionaries[lang];
}
