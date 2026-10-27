import { getCurrentUser, hasCurrentConsent, isStaff } from "@/lib/auth";
import { PRIVACY_VERSION, countWords } from "@/lib/ielts";
import { getScorer, ScorerNotConfiguredError } from "@/lib/scoring";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { CUSTOM_PROMPT_ID, findPrompt } from "@/lib/writing-prompts";
import type { EssayRow } from "@/lib/types";

// Scoring usually takes 10–25 seconds.
export const maxDuration = 60;

const MIN_WORDS_TO_SCORE = 50;
const MAX_WORDS = 1200;
const MAX_PROMPT_CHARS = 1000;

type Body = { promptId?: string; promptText?: string; essay?: string; consent?: boolean };

const fail = (status: number, error: string, code?: string) => Response.json({ error, code }, { status });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !user.profile) return fail(401, "Please log in to get feedback.", "login_required");

  let body: Body;
  try {
    body = await request.json();
  } catch {
    return fail(400, "Invalid request.");
  }

  const essay = String(body.essay ?? "").replace(/\r\n/g, "\n").trim();
  const wordCount = countWords(essay);
  const presetPrompt = findPrompt(body.promptId);
  const promptId = presetPrompt ? presetPrompt.id : CUSTOM_PROMPT_ID;
  const promptText = (presetPrompt?.text ?? String(body.promptText ?? "")).trim();

  if (promptText.length < 15) return fail(400, "Please choose a prompt or type the question you're answering.");
  if (promptText.length > MAX_PROMPT_CHARS) return fail(400, "That prompt is too long.");
  if (wordCount < MIN_WORDS_TO_SCORE) {
    return fail(400, `Write at least ${MIN_WORDS_TO_SCORE} words to get feedback (Task 2 needs 250).`);
  }
  if (wordCount > MAX_WORDS) return fail(400, `Please keep your essay under ${MAX_WORDS} words.`);

  // Nothing is stored until the student has agreed to the privacy policy.
  if (!hasCurrentConsent(user.profile)) {
    if (body.consent !== true) {
      return fail(403, "Please accept the Privacy Policy so we can save your essay.", "consent_required");
    }
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ privacy_accepted_at: new Date().toISOString(), privacy_version: PRIVACY_VERSION })
      .eq("id", user.id);
    if (error) return fail(500, "Couldn't save your consent. Please try again.");
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return fail(503, "Writing feedback isn't switched on yet. Please try again later.", "not_configured");
  }

  // Daily limit keeps API costs predictable. Teachers aren't limited.
  const dailyLimit = Number(process.env.WRITING_DAILY_LIMIT ?? 10);
  if (!isStaff(user.profile) && dailyLimit > 0) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("essays")
      .select("id", { count: "exact", head: true })
      .eq("student_id", user.id)
      .gte("created_at", since);
    if ((count ?? 0) >= dailyLimit) {
      return fail(429, `You've reached today's limit of ${dailyLimit} essays. Come back tomorrow, or ask your teacher for a review.`, "rate_limited");
    }
  }

  let result;
  try {
    result = await getScorer().score({ prompt: promptText, essay, wordCount });
  } catch (err) {
    if (err instanceof ScorerNotConfiguredError) {
      return fail(503, "Writing feedback isn't switched on yet. Please try again later.", "not_configured");
    }
    console.error("Essay scoring failed:", err);
    return fail(502, "We couldn't score your essay just now. Your text is still here — please try again in a minute.");
  }

  const { data: saved, error: insertError } = await admin
    .from("essays")
    .insert({
      student_id: user.id,
      prompt_id: promptId,
      prompt_text: promptText,
      body: essay,
      word_count: wordCount,
      overall_band: result.overall,
      task_response: result.criteria.taskResponse,
      coherence_cohesion: result.criteria.coherenceCohesion,
      lexical_resource: result.criteria.lexicalResource,
      grammar_accuracy: result.criteria.grammarAccuracy,
      criteria_notes: result.criteriaNotes,
      grammar_flags: result.grammarFlags,
      summary: result.summary,
      next_steps: result.nextSteps,
      scorer: result.scorer,
    })
    .select("*")
    .single();

  if (insertError || !saved) {
    console.error("Saving essay failed:", insertError);
    return fail(500, "Your essay was scored but couldn't be saved. Please try again.");
  }

  const { error: scoreError } = await admin.from("skill_scores").insert({
    student_id: user.id,
    skill: "writing",
    band: result.overall,
    source: "ai",
    label: "Writing Task 2 essay",
    essay_id: saved.id,
  });
  if (scoreError) console.error("Saving writing score failed:", scoreError);

  return Response.json({ essay: saved as EssayRow });
}
