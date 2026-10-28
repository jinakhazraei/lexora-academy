import { SKILLS, overallFromSkills } from "@/lib/ielts";
import type { ScoreSource, Skill, SkillScoreRow } from "@/lib/types";

/** Labels and dates are left to the page, which shows them in the visitor's language. */
export type SkillProgress = {
  skill: Skill;
  latest: SkillScoreRow | null;
  first: SkillScoreRow | null;
  change: number | null;
  count: number;
  points: { band: number; date: string; source: ScoreSource }[];
};

/** Group a student's scores (oldest first) into one progress summary per skill. */
export function summarizeProgress(scores: SkillScoreRow[]): SkillProgress[] {
  return SKILLS.map(({ key }) => {
    const rows = scores.filter((s) => s.skill === key);
    const latest = rows.at(-1) ?? null;
    const first = rows[0] ?? null;
    return {
      skill: key,
      latest,
      first,
      change: rows.length >= 2 && latest && first ? latest.band - first.band : null,
      count: rows.length,
      points: rows.slice(-12).map((r) => ({ band: Number(r.band), date: r.taken_on, source: r.source })),
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
  return overallFromSkills(latest.map(Number));
}
