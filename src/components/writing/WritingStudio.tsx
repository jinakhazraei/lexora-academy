"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { checkboxClasses } from "@/components/ConsentFields";
import Link from "@/components/LocaleLink";
import { BandDisclaimer } from "@/components/scores";
import { ResultsPanel } from "@/components/writing/ResultsPanel";
import { fmt, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { Dictionary } from "@/i18n/dictionaries";
import { rich } from "@/i18n/rich";
import { TASK2_MIN_WORDS, countWords } from "@/lib/ielts";
import { CUSTOM_PROMPT_ID, TASK2_PROMPTS, type QuestionType } from "@/lib/writing-prompts";
import type { EssayRow } from "@/lib/types";

type ErrorCode = keyof Dictionary["writing"]["errors"];

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
  const { lang, t } = useI18n();
  const w = t.writing;
  const topicLabel = (topic: string) => w.topics[topic as keyof typeof w.topics] ?? topic;
  const [error, setError] = useState<{ message: string; code?: ErrorCode } | null>(null);
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
          lang,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code: ErrorCode = typeof data.code === "string" && data.code in w.errors ? data.code : "generic";
        if (code === "consent_required") setConsentNeeded(true);
        setError({ message: fmt(w.errors[code], { min: data.min ?? "", max: data.max ?? "", limit: data.limit ?? "" }), code });
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
      setError({ message: w.offline });
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
              {w.step1}
            </label>
            {!isCustom && (
              <button type="button" onClick={pickRandom} className="cursor-pointer font-sans text-[13px] font-semibold text-gold hover:text-navy">
                {w.surprise}
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
              <optgroup key={type} label={w.types[type]}>
                {TASK2_PROMPTS.filter((p) => p.type === type).map((p) => (
                  <option key={p.id} value={p.id}>
                    {topicLabel(p.topic)} — {p.text.length > 70 ? `${p.text.slice(0, 70)}…` : p.text}
                  </option>
                ))}
              </optgroup>
            ))}
            <option value={CUSTOM_PROMPT_ID}>{w.ownQuestion}</option>
          </select>

          {isCustom ? (
            <textarea
              aria-label={w.ownLabel}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder={w.ownPlaceholder}
              lang="en"
              className="mt-3 w-full rounded-lg border border-border-soft bg-cream/50 px-3.5 py-3 font-sans text-[14.5px] leading-relaxed text-ink placeholder:text-placeholder focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
            />
          ) : (
            selected && (
              <div className="mt-3 rounded-xl border-l-[3px] border-gold bg-cream px-4 py-3.5">
                <div className="mb-1.5 font-sans text-[11px] font-bold uppercase tracking-wide text-badge-text">
                  {topicLabel(selected.topic)} · {w.types[selected.type]}
                </div>
                <p lang="en" className="font-display text-[17px] leading-relaxed text-navy">
                  {selected.text}
                </p>
              </div>
            )
          )}
        </section>

        <section className="rounded-[20px] border border-border-soft bg-white p-5 sm:p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="essay" className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
              {w.step2}
            </label>
            <span className="font-sans text-[12px] text-meta">{w.timeHint}</span>
          </div>
          <textarea
            id="essay"
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="sentences"
            lang="en"
            placeholder={w.essayPlaceholder}
            className="min-h-[380px] w-full resize-y rounded-lg border border-border-soft bg-cream/40 px-4 py-3.5 font-sans text-[15px] leading-[1.75] text-ink placeholder:text-placeholder focus:border-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold/20 sm:min-h-[440px]"
          />

          {/* Live word counter */}
          <div className="mt-3" aria-live="polite">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2 font-sans text-[13px]">
              <span className="font-semibold text-navy">
                <span className="tabular-nums">{plural(words, lang, t.common.wordForms)}</span>
                <span className={`ml-2 font-normal ${reachedMin ? "text-[#2f6b2a]" : "text-meta"}`}>
                  {reachedMin ? w.minReached : fmt(w.toGo, { count: TASK2_MIN_WORDS - words, min: TASK2_MIN_WORDS })}
                </span>
              </span>
              <span className="text-[12px] text-meta">{draftSaved ? w.draftSaved : ""}</span>
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
                {accountsEnabled ? w.signedOutAccounts : w.signedOutSoon}
              </p>
              {accountsEnabled && (
                <div className="flex shrink-0 gap-2">
                  <Link href={`/login?next=/${lang}/writing`} className="rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white">
                    {w.login}
                  </Link>
                  <Link href={`/signup?next=/${lang}/writing`} className="rounded-lg bg-gold px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:text-navy hover:brightness-95">
                    {w.createAccount}
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
                    {rich(w.consent, {
                      policy: (
                        <Link href="/privacy" target="_blank" className="font-semibold">
                          {t.footer.privacy}
                        </Link>
                      ),
                    })}
                  </span>
                </label>
              )}
              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 font-sans text-[13px] font-semibold text-red-700">
                  {error.message}
                  {error.code === "login_required" && (
                    <>
                      {" "}
                      <Link href={`/login?next=/${lang}/writing`}>{w.logInAgain}</Link>
                    </>
                  )}
                </div>
              )}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sans text-[13px] leading-relaxed text-muted">
                  {words < MIN_WORDS_TO_SCORE ? fmt(w.minToScore, { min: MIN_WORDS_TO_SCORE }) : w.takesTime}
                </p>
                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSubmit}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gold px-6 py-3.5 font-sans text-[14px] font-bold text-navy transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "scoring" ? w.reading : result ? w.getAgain : w.getFeedback}
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
              {w.newEssay}
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
  const { t } = useI18n();
  const w = t.writing;
  return (
    <div className="rounded-[20px] border border-dashed border-[#d8cfba] bg-white/60 p-6 sm:p-7">
      <div className="mb-1 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{w.step3}</div>
      <p className="mb-5 font-sans text-sm text-muted">{w.youllSee}</p>
      <ul className="flex flex-col gap-4">
        {w.preview.map(([title, desc]) => (
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
          {w.sendAnyHint}{" "}
          <Link href="/how-our-ai-works" className="font-semibold">
            {w.howAi}
          </Link>
        </p>
      </div>
    </div>
  );
}

function ScoringSkeleton() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-live="polite">
      <div className="rounded-[20px] bg-navy p-7">
        <div className="flex items-center gap-5">
          <div className="h-[92px] w-[92px] animate-pulse rounded-full border-[3px] border-gold-light/40" />
          <div className="flex-1">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-gold-light">{t.writing.reading}</div>
            <div className="font-sans text-sm text-white/60">{t.writing.readingHint}</div>
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
