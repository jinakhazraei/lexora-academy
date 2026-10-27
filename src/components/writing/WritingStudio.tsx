"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { checkboxClasses } from "@/components/ConsentFields";
import { BandDisclaimer } from "@/components/scores";
import { ResultsPanel } from "@/components/writing/ResultsPanel";
import { TASK2_MIN_WORDS, countWords } from "@/lib/ielts";
import { CUSTOM_PROMPT_ID, TASK2_PROMPTS, type QuestionType } from "@/lib/writing-prompts";
import type { EssayRow } from "@/lib/types";

const DRAFT_KEY = "lexora-writing-draft-v1";
const MIN_WORDS_TO_SCORE = 50;

type Status = "idle" | "scoring" | "done" | "error";
type Draft = { promptId: string; customPrompt: string; essay: string };

const TYPE_ORDER: QuestionType[] = [
  "Opinion",
  "Discussion",
  "Advantages & Disadvantages",
  "Problem & Solution",
  "Two-part question",
];

export function WritingStudio({
  signedIn,
  needsConsent,
  accountsEnabled,
}: {
  signedIn: boolean;
  needsConsent: boolean;
  accountsEnabled: boolean;
}) {
  const [promptId, setPromptId] = useState(TASK2_PROMPTS[0].id);
  const [customPrompt, setCustomPrompt] = useState("");
  const [essay, setEssay] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [result, setResult] = useState<EssayRow | null>(null);
  const [consentNeeded, setConsentNeeded] = useState(needsConsent);
  const [consentChecked, setConsentChecked] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const loaded = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Restore the draft once, so nothing is lost on refresh or after logging in.
  // localStorage only exists in the browser, so this must run after hydration.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw) as Partial<Draft>;
        if (typeof d.essay === "string") setEssay(d.essay);
        if (typeof d.customPrompt === "string") setCustomPrompt(d.customPrompt);
        if (d.promptId === CUSTOM_PROMPT_ID || TASK2_PROMPTS.some((p) => p.id === d.promptId)) {
          setPromptId(d.promptId as string);
        }
      }
    } catch {
      // Storage unavailable (private mode, blocked) — the editor still works.
    }
    loaded.current = true;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loaded.current) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ promptId, customPrompt, essay } satisfies Draft));
        setDraftSaved(true);
      } catch {
        setDraftSaved(false);
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [promptId, customPrompt, essay]);

  const words = useMemo(() => countWords(essay), [essay]);
  const isCustom = promptId === CUSTOM_PROMPT_ID;
  const selected = TASK2_PROMPTS.find((p) => p.id === promptId);
  const promptText = isCustom ? customPrompt.trim() : (selected?.text ?? "");
  const progress = Math.min(words / TASK2_MIN_WORDS, 1);
  const reachedMin = words >= TASK2_MIN_WORDS;
  const canSubmit =
    signedIn &&
    status !== "scoring" &&
    words >= MIN_WORDS_TO_SCORE &&
    promptText.length >= 15 &&
    (!consentNeeded || consentChecked);

  function pickRandom() {
    const others = TASK2_PROMPTS.filter((p) => p.id !== promptId);
    setPromptId(others[Math.floor(Math.random() * others.length)].id);
  }

  function startNew() {
    setEssay("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }

  async function submit() {
    if (!canSubmit) return;
    setStatus("scoring");
    setError(null);
    try {
      const res = await fetch("/api/writing/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: isCustom ? CUSTOM_PROMPT_ID : promptId,
          promptText,
          essay,
          consent: consentNeeded ? consentChecked : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "consent_required") setConsentNeeded(true);
        setError({ message: data.error ?? "Something went wrong. Please try again.", code: data.code });
        setStatus("error");
        return;
      }
      setConsentNeeded(false);
      setResult(data.essay as EssayRow);
      setStatus("done");
      requestAnimationFrame(() => {
        if (window.matchMedia("(max-width: 1023px)").matches) {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } catch {
      setError({ message: "You seem to be offline. Your essay is saved here — try again when you're connected." });
      setStatus("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
      {/* ── Editor ── */}
      <div className="flex flex-col gap-5">
        <section className="rounded-[20px] border border-border-soft bg-white p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="prompt" className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
              1 · Choose a Task 2 question
            </label>
            {!isCustom && (
              <button type="button" onClick={pickRandom} className="cursor-pointer font-sans text-[13px] font-semibold text-gold hover:text-navy">
                ↻ Surprise me
              </button>
            )}
          </div>
          <select
            id="prompt"
            value={promptId}
            onChange={(e) => setPromptId(e.target.value)}
            className="w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 font-sans text-sm text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          >
            {TYPE_ORDER.map((type) => (
              <optgroup key={type} label={type}>
                {TASK2_PROMPTS.filter((p) => p.type === type).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.topic} — {p.text.length > 70 ? `${p.text.slice(0, 70)}…` : p.text}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM_PROMPT_ID}>✎ Use my own question</option>
          </select>

          {isCustom ? (
            <textarea
              aria-label="Your Task 2 question"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Paste or type the Task 2 question you're answering…"
              className="mt-3 w-full rounded-lg border border-border-soft bg-cream/50 px-3.5 py-3 font-sans text-[14.5px] leading-relaxed text-ink placeholder:text-placeholder focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          ) : (
            selected && (
              <div className="mt-3 rounded-xl border-l-[3px] border-gold bg-cream px-4 py-3.5">
                <div className="mb-1.5 font-sans text-[11px] font-bold uppercase tracking-wide text-badge-text">
                  {selected.topic} · {selected.type}
                </div>
                <p className="font-display text-[17px] leading-relaxed text-navy">{selected.text}</p>
              </div>
            )
          )}
        </section>

        <section className="rounded-[20px] border border-border-soft bg-white p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="essay" className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
              2 · Write your essay
            </label>
            <span className="font-sans text-[12px] text-meta">Aim for 40 minutes, as in the exam</span>
          </div>
          <textarea
            id="essay"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="sentences"
            placeholder="Start writing here. Plan an introduction, two or three body paragraphs and a conclusion…"
            className="min-h-[380px] w-full resize-y rounded-lg border border-border-soft bg-cream/40 px-4 py-3.5 font-sans text-[15px] leading-[1.75] text-ink placeholder:text-placeholder focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/20 sm:min-h-[440px]"
          />

          {/* Live word counter */}
          <div className="mt-3" aria-live="polite">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 font-sans text-[13px]">
              <span className="font-semibold text-navy">
                <span className="tabular-nums">{words}</span> {words === 1 ? "word" : "words"}
                <span className={`ml-2 font-normal ${reachedMin ? "text-[#2f6b2a]" : "text-meta"}`}>
                  {reachedMin ? "✓ Task 2 minimum reached" : `${TASK2_MIN_WORDS - words} to go for the ${TASK2_MIN_WORDS}-word minimum`}
                </span>
              </span>
              <span className="text-[12px] text-meta">{draftSaved ? "Draft saved on this device" : ""}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-cream-alt">
              <div
                className={`h-full rounded-full transition-[width] duration-300 ${reachedMin ? "bg-[#3d8a37]" : "bg-gold"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <section className="rounded-[20px] border border-border-soft bg-white p-5 sm:p-6">
          {!signedIn ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-sans text-sm leading-relaxed text-muted">
                {accountsEnabled
                  ? "Log in or create a free student account to get feedback. Your draft stays here."
                  : "Online feedback is coming soon. Your draft is saved on this device."}
              </p>
              {accountsEnabled && (
                <div className="flex shrink-0 gap-2">
                  <Link href="/login?next=/writing" className="rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white">
                    Log in
                  </Link>
                  <Link href="/signup?next=/writing" className="rounded-lg bg-gold px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:text-navy hover:brightness-95">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {consentNeeded && (
                <label className="flex cursor-pointer gap-3 rounded-xl border border-border-soft bg-cream/60 p-4 font-sans text-[13px] leading-relaxed text-ink">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className={checkboxClasses}
                  />
                  <span>
                    Before we save your first essay: I&apos;ve read the{" "}
                    <Link href="/privacy" target="_blank" className="font-semibold">
                      Privacy Policy
                    </Link>{" "}
                    and agree that Lexora Academy can store my essays, scores and teacher feedback.
                  </span>
                </label>
              )}
              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 font-sans text-[13px] font-semibold text-red-700">
                  {error.message}
                  {error.code === "login_required" && (
                    <>
                      {" "}
                      <Link href="/login?next=/writing">Log in again</Link>
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-[13px] leading-relaxed text-muted">
                  {words < MIN_WORDS_TO_SCORE
                    ? `Write at least ${MIN_WORDS_TO_SCORE} words to get feedback.`
                    : "Feedback usually takes 10–20 seconds."}
                </p>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gold px-6 py-3.5 font-sans text-[14px] font-bold text-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "scoring" ? "Reading your essay…" : result ? "Get feedback again" : "Get feedback"}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Results ── */}
      <div ref={resultsRef} className="scroll-mt-24 lg:sticky lg:top-28">
        {status === "scoring" ? (
          <ScoringSkeleton />
        ) : result ? (
          <div className="flex flex-col gap-4">
            <ResultsPanel essay={result} showTeacherButton showHistoryLink />
            <button type="button" onClick={startNew} className="cursor-pointer self-start font-sans text-[13px] font-semibold text-muted hover:text-navy">
              Start a new essay
            </button>
          </div>
        ) : (
          <EmptyResults />
        )}
      </div>
    </div>
  );
}

function EmptyResults() {
  const items = [
    ["Overall band", "An estimated Task 2 band from 0 to 9."],
    ["Four criteria", "Task Response, Coherence & Cohesion, Lexical Resource, and Grammar — each with a note."],
    ["Grammar flags", "The exact phrases to fix, with a corrected version."],
    ["A short summary", "What's working, and the one thing to improve next."],
  ];
  return (
    <div className="rounded-[20px] border border-dashed border-[#d8cfba] bg-white/60 p-6 sm:p-7">
      <div className="mb-1 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">3 · Your feedback</div>
      <p className="mb-5 font-sans text-sm text-muted">After you submit, you&apos;ll see:</p>
      <ul className="flex flex-col gap-4">
        {items.map(([title, desc]) => (
          <li key={title} className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
            <div>
              <div className="font-sans text-[14px] font-semibold text-navy">{title}</div>
              <div className="font-sans text-[13px] leading-relaxed text-muted">{desc}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t border-cream-alt pt-4">
        <BandDisclaimer />
        <p className="mt-2 font-sans text-[12px] leading-relaxed text-meta">
          You can send any result to your teacher for a second look.{" "}
          <Link href="/how-our-ai-works" className="font-semibold">
            How our AI works
          </Link>
        </p>
      </div>
    </div>
  );
}

function ScoringSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <div className="rounded-[20px] bg-navy p-7">
        <div className="flex items-center gap-5">
          <div className="h-[92px] w-[92px] animate-pulse rounded-full border-[3px] border-gold-light/40" />
          <div className="flex-1">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-gold-light">Reading your essay…</div>
            <div className="font-sans text-sm text-white/60">Checking the four criteria and your language. Usually 10–20 seconds.</div>
          </div>
        </div>
      </div>
      <div className="rounded-[20px] border border-border-soft bg-white p-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-5 last:mb-0">
            <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-cream-alt" />
            <div className="h-2 w-full animate-pulse rounded-full bg-cream-alt" />
          </div>
        ))}
      </div>
    </div>
  );
}
