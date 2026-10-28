export const locales = ["hy", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

/** Used when the visitor's browser prefers none of our languages. */
export const defaultLocale: Locale = "en";

/** Remembers the language a visitor last used, so links without a language go back to it. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export const localeNames: Record<Locale, { native: string; short: string }> = {
  hy: { native: "Հայերեն", short: "ՀԱՅ" },
  ru: { native: "Русский", short: "РУС" },
  en: { native: "English", short: "ENG" },
};


export function hasLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/** A supported language from untrusted input (a form field, a request body), or the default. */
export function langFrom(value: unknown): Locale {
  return hasLocale(value) ? value : defaultLocale;
}

/** Paths that are never language-prefixed. */
const UNLOCALIZED = /^\/(api|auth\/callback|_next|images|video)(\/|$)/;

/** "/dashboard" → "/hy/dashboard". Leaves external, already-prefixed and API paths alone. */
export function localizePath(lang: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || UNLOCALIZED.test(path)) return path;
  if (locales.some((l) => path === `/${l}` || path.startsWith(`/${l}/`) || path.startsWith(`/${l}?`) || path.startsWith(`/${l}#`))) {
    return path;
  }
  return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/** "/hy/dashboard?x=1" → { lang: "hy", rest: "/dashboard?x=1" } */
export function splitLocale(path: string): { lang: Locale | null; rest: string } {
  const m = path.match(/^\/([a-z]{2})(?=\/|\?|#|$)(.*)$/);
  if (m && hasLocale(m[1])) return { lang: m[1], rest: m[2] || "/" };
  return { lang: null, rest: path };
}

/** Pick the best supported language from an Accept-Language header. */
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) || 0 : 1 };
    })
    .filter((x) => x.tag && x.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (hasLocale(base)) return base;
  }
  return null;
}

/** "{count} words" → "12 words" */
export function fmt(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

// Dates, numbers and plurals are formatted by hand rather than with Intl: Chrome ships without
// Armenian locale data, so Intl gives "2026 M10 27" and "54,000" there, while the server (Node,
// full ICU) prints "27 հոկ, 2026 թ." and "54 000". Doing it ourselves keeps the server and every
// browser identical, which React needs when it picks up a server-rendered page.

const MONTHS: Record<Locale, { short: string[]; long: string[] }> = {
  hy: {
    short: ["հնվ", "փտվ", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"],
    long: ["հունվարի", "փետրվարի", "մարտի", "ապրիլի", "մայիսի", "հունիսի", "հուլիսի", "օգոստոսի", "սեպտեմբերի", "հոկտեմբերի", "նոյեմբերի", "դեկտեմբերի"],
  },
  ru: {
    short: ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."],
    long: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  },
  en: {
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
};

type DateStyle = { month?: "short" | "long"; year?: boolean };

/**
 * "27 Oct 2026" · "27 окт. 2026 г." · "27 հոկ, 2026 թ." — in Yerevan time (UTC+4 all year),
 * so a late-evening timestamp shows the day the student saw. Date-only strings stay on their day.
 */
export function formatDate(iso: string, lang: Locale, style: DateStyle = {}): string {
  const { month = "short", year = true } = style;
  const ms = Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(ms)) return iso;
  const d = new Date(ms + 4 * 3_600_000);
  const day = d.getUTCDate();
  const m = MONTHS[lang][month][d.getUTCMonth()];
  const y = d.getUTCFullYear();
  if (!year) return `${day} ${m}`;
  if (lang === "hy") return `${day} ${m}, ${y} թ.`;
  if (lang === "ru") return `${day} ${m} ${y} г.`;
  return `${day} ${m} ${y}`;
}

type PluralForms = { one: string; few: string; many: string; other: string };

function pluralCategory(n: number, lang: Locale): keyof PluralForms {
  if (!Number.isInteger(n)) return "other";
  if (lang === "ru") {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  }
  if (lang === "hy") return n === 0 || n === 1 ? "one" : "other";
  return n === 1 ? "one" : "other";
}

/** "1 word", "273 слова", "5 слов" — picks the right form for the number in each language. */
export function plural(n: number, lang: Locale, forms: PluralForms): string {
  return `${n} ${forms[pluralCategory(n, lang)]}`;
}

/** Whole numbers with thousands separators: "54,000" (en), "54 000" (hy, ru — non-breaking space). */
export function formatNumber(n: number, lang: Locale): string {
  const sign = n < 0 ? "-" : "";
  const digits = String(Math.round(Math.abs(n)));
  const sep = lang === "en" ? "," : "\u00a0";
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
