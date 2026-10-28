import type { Locale } from "@/i18n/config";
import type { CriterionKey, GrammarFlag } from "@/lib/types";

export type EssayInput = {
  prompt: string;
  essay: string;
  wordCount: number;
  /** Language for the explanations (notes, issues, summary, next steps). Corrections stay in English. */
  feedbackLanguage: Locale;
};

export type EssayScore = {
  overall: number;
  criteria: Record<CriterionKey, number>;
  criteriaNotes: Record<CriterionKey, string>;
  grammarFlags: GrammarFlag[];
  summary: string;
  nextSteps: string[];
  /** Which engine produced this, e.g. "claude:claude-sonnet-5-5". Stored with the essay. */
  scorer: string;
};

/**
 * Anything that can score an IELTS Task 2 essay. Claude is the first
 * implementation; Lexora's own model plugs in through `httpScorer`.
 */
export interface EssayScorer {
  readonly name: string;
  score(input: EssayInput): Promise<EssayScore>;
}

export class ScorerNotConfiguredError extends Error {}
