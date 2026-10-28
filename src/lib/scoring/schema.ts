import { CRITERIA, overallFromCriteria } from "@/lib/ielts";
import type { CriterionKey, GrammarFlag, GrammarFlagCategory } from "@/lib/types";
import type { EssayScore } from "@/lib/scoring/types";

/**
 * The JSON every scorer returns. Claude is held to it with structured outputs;
 * a custom model endpoint should return the same shape (see docs/WRITING_SCORER.md).
 */
const CRITERION_SCHEMA = {
  type: "object",
  properties: {
    band: { type: "integer", description: "Whole band from 0 to 9." },
    note: { type: "string", description: "1–2 sentences about this essay, addressed to the student as 'you'." },
  },
  required: ["band", "note"],
  additionalProperties: false,
} as const;

export const RAW_SCORE_SCHEMA = {
  type: "object",
  properties: {
    task_response: CRITERION_SCHEMA,
    coherence_cohesion: CRITERION_SCHEMA,
    lexical_resource: CRITERION_SCHEMA,
    grammar_accuracy: CRITERION_SCHEMA,
    grammar_flags: {
      type: "array",
      description: "Up to 8 of the most useful language corrections, most important first.",
      items: {
        type: "object",
        properties: {
          excerpt: {
            type: "string",
            description: "The exact words from the essay, copied character for character, at most 12 words.",
          },
          issue: { type: "string", description: "One short, plain-English sentence explaining the problem." },
          suggestion: { type: "string", description: "The corrected version of the excerpt." },
          category: { type: "string", enum: ["grammar", "punctuation", "spelling", "word choice", "cohesion"] },
        },
        required: ["excerpt", "issue", "suggestion", "category"],
        additionalProperties: false,
      },
    },
    summary: { type: "string", description: "2–3 sentences to the student: honest, specific and encouraging." },
    next_steps: {
      type: "array",
      description: "2–3 concrete things the student should practise next.",
      items: { type: "string" },
    },
  },
  required: [
    "task_response",
    "coherence_cohesion",
    "lexical_resource",
    "grammar_accuracy",
    "grammar_flags",
    "summary",
    "next_steps",
  ],
  additionalProperties: false,
} as const;

type RawCriterion = { band: number; note: string };
export type RawScore = {
  task_response: RawCriterion;
  coherence_cohesion: RawCriterion;
  lexical_resource: RawCriterion;
  grammar_accuracy: RawCriterion;
  grammar_flags: { excerpt: string; issue: string; suggestion: string; category: string }[];
  summary: string;
  next_steps: string[];
};

const RAW_KEYS: Record<CriterionKey, keyof RawScore> = {
  taskResponse: "task_response",
  coherenceCohesion: "coherence_cohesion",
  lexicalResource: "lexical_resource",
  grammarAccuracy: "grammar_accuracy",
};

const CATEGORIES: GrammarFlagCategory[] = ["grammar", "punctuation", "spelling", "word choice", "cohesion"];

const normalizeSpace = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

function clampWhole(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(9, Math.max(0, Math.round(n)));
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Turn any scorer's raw JSON into a safe EssayScore:
 *  - criteria become whole bands 0–9;
 *  - the overall band is always computed here, never trusted from the model;
 *  - grammar flags whose excerpt isn't really in the essay are dropped.
 */
export function normalizeScore(raw: unknown, essay: string, scorer: string): EssayScore {
  if (!raw || typeof raw !== "object") throw new Error("Scorer returned no result.");
  const r = raw as Partial<RawScore>;

  const criteria = {} as Record<CriterionKey, number>;
  const criteriaNotes = {} as Record<CriterionKey, string>;
  for (const { key } of CRITERIA) {
    const c = r[RAW_KEYS[key]] as RawCriterion | undefined;
    if (!c || typeof c !== "object") throw new Error(`Scorer result is missing ${RAW_KEYS[key]}.`);
    criteria[key] = clampWhole(c.band);
    criteriaNotes[key] = cleanText(c.note, 600);
  }

  const haystack = normalizeSpace(essay);
  const seen = new Set<string>();
  const grammarFlags: GrammarFlag[] = [];
  for (const f of Array.isArray(r.grammar_flags) ? r.grammar_flags : []) {
    const excerpt = cleanText(f?.excerpt, 200);
    const needle = normalizeSpace(excerpt);
    if (!needle || !haystack.includes(needle) || seen.has(needle)) continue;
    seen.add(needle);
    const category = CATEGORIES.find((c) => c === String(f.category).toLowerCase()) ?? "grammar";
    // Show the student's own words exactly as typed, even if the model changed the casing.
    const at = essay.toLowerCase().indexOf(excerpt.toLowerCase());
    grammarFlags.push({
      excerpt: at >= 0 ? essay.slice(at, at + excerpt.length) : excerpt,
      issue: cleanText(f.issue, 300),
      suggestion: cleanText(f.suggestion, 300),
      category,
    });
    if (grammarFlags.length >= 8) break;
  }

  const nextSteps = (Array.isArray(r.next_steps) ? r.next_steps : [])
    .map((s) => cleanText(s, 300))
    .filter(Boolean)
    .slice(0, 3);

  return {
    overall: overallFromCriteria(criteria),
    criteria,
    criteriaNotes,
    grammarFlags,
    summary: cleanText(r.summary, 1200),
    nextSteps,
    scorer,
  };
}
