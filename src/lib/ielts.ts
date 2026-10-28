import type { CriterionKey, ScoreSource, Skill } from "@/lib/types";

/** Shown next to every score on the site. */
export const BAND_DISCLAIMER = "Estimated band, not an official IELTS score.";

/** Bump when the privacy policy changes in a way students should re-accept. */
export const PRIVACY_VERSION = "2026-10-27";

export const TASK2_MIN_WORDS = 250;

export const SKILLS: { key: Skill; label: string }[] = [
  { key: "listening", label: "Listening" },
  { key: "reading", label: "Reading" },
  { key: "writing", label: "Writing" },
  { key: "speaking", label: "Speaking" },
];

export const CRITERIA: { key: CriterionKey; label: string; short: string; column: string }[] = [
  { key: "taskResponse", label: "Task Response", short: "TR", column: "task_response" },
  { key: "coherenceCohesion", label: "Coherence & Cohesion", short: "CC", column: "coherence_cohesion" },
  { key: "lexicalResource", label: "Lexical Resource", short: "LR", column: "lexical_resource" },
  { key: "grammarAccuracy", label: "Grammatical Range & Accuracy", short: "GRA", column: "grammar_accuracy" },
];

export const SOURCE_LABELS: Record<ScoreSource, string> = {
  ai: "AI estimate",
  teacher: "Teacher-assessed",
  self: "Practice test",
};

/** Clamp to 0–9 and round to the nearest half band. */
export function toBand(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const clamped = Math.min(9, Math.max(0, value));
  return Math.round(clamped * 2) / 2;
}

/**
 * Overall writing band from the four criteria: the average, rounded DOWN to the
 * nearest half band. Rounding down keeps the estimate conservative.
 */
export function overallFromCriteria(criteria: Record<CriterionKey, number>): number {
  const values = CRITERIA.map((c) => criteria[c.key]);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.floor(avg * 2 + 1e-9) / 2;
}

/**
 * Overall IELTS band from four skills: the average, rounded to the nearest half
 * band, with .25 and .75 rounding up (the published IELTS rule).
 */
export function overallFromSkills(bands: number[]): number {
  const avg = bands.reduce((a, b) => a + b, 0) / bands.length;
  return Math.floor(avg * 2 + 0.5 + 1e-9) / 2;
}

export function formatBand(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(1) : "—";
}

/** Counts words the way a student would: anything separated by spaces that has a letter or digit. */
export function countWords(text: string): number {
  const tokens = text.trim().split(/\s+/);
  return tokens.filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

export function isBand(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && value <= 9 && Number.isInteger(value * 2);
}

/** Only allow same-site relative redirects after login. */
export function safeNextPath(next: unknown, fallback = "/dashboard"): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
