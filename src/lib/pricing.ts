// Lexora Academy price list, in Armenian drams (AMD), per student.
// Source: "Lexora Academy — Course Pricing" (28 Oct 2026). Change prices here only.
import type { CourseId } from "@/lib/data";
import { formatNumber, type Locale } from "@/i18n/config";

export type PriceLine = "ielts" | "business" | "general";
export type PriceFormat = "individual" | "pair" | "group";
export type Mode = "online" | "home";

export const priceLines: PriceLine[] = ["ielts", "business", "general"];
export const priceFormats: PriceFormat[] = ["individual", "pair", "group"];

/** Hours in a monthly package. */
export const hoursPerMonth: Record<PriceFormat, number> = { individual: 12, pair: 12, group: 18 };

/** Group sizes: [minimum to open, maximum]. */
export const groupSize: Record<PriceLine, [number, number]> = {
  ielts: [3, 6],
  business: [3, 6],
  general: [4, 8],
};

/** Price per hour. Monthly = hourly × hours per month. */
export const hourly: Record<PriceLine, Record<PriceFormat, Record<Mode, number>>> = {
  ielts: {
    individual: { online: 8000, home: 10000 },
    pair: { online: 5000, home: 6000 },
    group: { online: 3000, home: 4000 },
  },
  business: {
    individual: { online: 7000, home: 9000 },
    pair: { online: 4500, home: 5500 },
    group: { online: 2500, home: 3500 },
  },
  general: {
    individual: { online: 6000, home: 8000 },
    pair: { online: 3500, home: 4500 },
    group: { online: 2000, home: 2750 },
  },
};

export function monthly(line: PriceLine, format: PriceFormat, mode: Mode) {
  return hourly[line][format][mode] * hoursPerMonth[format];
}

/** A single 90-minute home visit. */
export function homeVisit(line: PriceLine) {
  return hourly[line].individual.home * 1.5;
}

export const extras = {
  mockExam: 10000,
  speakingMock: 4000,
  writingTask: 3000,
  corporateOnline: 15000,
  corporateOnsite: 18000,
};

/** Which price line a course on the site belongs to, and its cheapest monthly option. */
export const coursePriceLine: Record<CourseId, PriceLine> = {
  general: "general",
  ielts: "ielts",
  toefl: "ielts",
  business: "business",
  private: "general",
};

export function startingMonthly(course: CourseId) {
  const line = coursePriceLine[course];
  return course === "private" ? monthly(line, "individual", "online") : monthly(line, "group", "online");
}

/** "96,000 AMD" / "96 000 драм" / "96 000 դրամ" */
export function formatAmd(amount: number, lang: Locale, currency: string) {
  return `${formatNumber(amount, lang)} ${currency}`;
}
