import "server-only";
import { normalizeScore } from "@/lib/scoring/schema";
import { ScorerNotConfiguredError, type EssayInput, type EssayScorer } from "@/lib/scoring/types";

/**
 * Calls Lexora's own scoring model over HTTP. The endpoint receives
 *   POST { prompt, essay, word_count, feedback_language }
 * and returns the same JSON shape as RAW_SCORE_SCHEMA (see docs/WRITING_SCORER.md).
 */
export const httpScorer: EssayScorer = {
  name: "http",
  async score(input: EssayInput) {
    const url = process.env.ESSAY_SCORER_URL;
    if (!url) throw new ScorerNotConfiguredError("ESSAY_SCORER_URL is not set.");

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.ESSAY_SCORER_TOKEN ? { Authorization: `Bearer ${process.env.ESSAY_SCORER_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        prompt: input.prompt,
        essay: input.essay,
        word_count: input.wordCount,
        feedback_language: input.feedbackLanguage,
      }),
      signal: AbortSignal.timeout(55_000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Scoring service responded with ${res.status}.`);

    const raw = await res.json();
    const version = typeof raw?.model_version === "string" ? raw.model_version.slice(0, 40) : "custom";
    return normalizeScore(raw, input.essay, `lexora:${version}`);
  },
};
