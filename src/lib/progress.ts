import { SKILLS, SOURCE_LABELS, overallFromSkills } from "@/lib/ielts";
import type { Skill, SkillScoreRow } from "@/lib/types";

export type SkillProgress = {
  skill: Skill;
  label: string;
  latest: SkillScoreRow | null;
  first: SkillScoreRow | null;
  change: number | null;
  count: number;
  points: { band: number; date: string; source: string }[];
};

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** Group a student's scores (oldest first) into one progress summary per skill. */
export function summarizeProgress(scores: SkillScoreRow[]): SkillProgress[] {
  return SKILLS.map(({ key, label }) => {
    const rows = scores.filter((s) => s.skill === key);
    const latest = rows.at(-1) ?? null;
    const first = rows[0] ?? null;
    return {
      skill: key,
      label,
      latest,
      first,
      change: rows.length >= 2 && latest && first ? latest.band - first.band : null,
      count: rows.length,
      points: rows.slice(-12).map((r) => ({ band: r.band, date: shortDate(r.taken_on), source: SOURCE_LABELS[r.source] })),
    };
  });
}

/** Whole days from now until a YYYY-MM-DD date (negative once it has passed). */
export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
}

/** Overall estimate from the latest band in each skill — only when all four exist. */
export function overallEstimate(progress: SkillProgress[]) {
  const latest = progress.map((p) => p.latest?.band);
  if (latest.some((b) => b === undefined)) return null;
  return overallFromSkills(latest as number[]);
}
