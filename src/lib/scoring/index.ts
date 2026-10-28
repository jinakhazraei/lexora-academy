import "server-only";
import { claudeScorer } from "@/lib/scoring/claude";
import { httpScorer } from "@/lib/scoring/http";
import type { EssayScorer } from "@/lib/scoring/types";

/**
 * Pick the essay scorer from ESSAY_SCORER:
 *   "claude" (default) — Claude via the Anthropic API
 *   "http"             — Lexora's own model at ESSAY_SCORER_URL
 */
export function getScorer(): EssayScorer {
  return process.env.ESSAY_SCORER === "http" ? httpScorer : claudeScorer;
}

export { ScorerNotConfiguredError } from "@/lib/scoring/types";
export type { EssayScore } from "@/lib/scoring/types";
