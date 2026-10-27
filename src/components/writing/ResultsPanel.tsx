import Link from "next/link";
import { BandDisclaimer, CriterionBar } from "@/components/scores";
import { SendToTeacher } from "@/components/writing/SendToTeacher";
import { CRITERIA, TASK2_MIN_WORDS, formatBand } from "@/lib/ielts";
import type { EssayRow, GrammarFlag } from "@/lib/types";

export type ReviewForDisplay = {
  id: string;
  comment: string;
  overall_band: number | null;
  created_at: string;
  teacher_name: string | null;
};

const CATEGORY_STYLES: Record<GrammarFlag["category"], string> = {
  grammar: "bg-[#eef2fb] text-[#2b4a8a]",
  punctuation: "bg-[#f3eefb] text-[#5b3b8f]",
  spelling: "bg-[#fbeeee] text-[#9a3434]",
  "word choice": "bg-badge-bg text-badge-text",
  cohesion: "bg-[#ecf6f1] text-[#25664a]",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type EssayForResults = Pick<
  EssayRow,
  | "id"
  | "overall_band"
  | "task_response"
  | "coherence_cohesion"
  | "lexical_resource"
  | "grammar_accuracy"
  | "criteria_notes"
  | "grammar_flags"
  | "summary"
  | "next_steps"
  | "word_count"
  | "review_status"
  | "created_at"
>;

export function ResultsPanel({
  essay,
  reviews = [],
  showTeacherButton = false,
  showHistoryLink = false,
}: {
  essay: EssayForResults;
  reviews?: ReviewForDisplay[];
  showTeacherButton?: boolean;
  showHistoryLink?: boolean;
}) {
  const bands = {
    taskResponse: essay.task_response,
    coherenceCohesion: essay.coherence_cohesion,
    lexicalResource: essay.lexical_resource,
    grammarAccuracy: essay.grammar_accuracy,
  };
  const underLength = essay.word_count < TASK2_MIN_WORDS;
  const flags = essay.grammar_flags ?? [];
  const steps = essay.next_steps ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Overall band */}
      <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,#0A1428,#1B2C52_70%,#0F1B33)] p-6 sm:p-7">
        <div className="flex items-center gap-5">
          <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center rounded-full border-[3px] border-gold-light/80 bg-white/[0.06]">
            <span className="font-display text-[40px] font-semibold leading-none tabular-nums text-gold-light">
              {formatBand(essay.overall_band)}
            </span>
          </div>
          <div>
            <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-[0.14em] text-gold-light">
              Overall writing band
            </div>
            <div className="font-sans text-sm text-white/70">
              {essay.word_count} words · {formatDate(essay.created_at)}
            </div>
          </div>
        </div>
        <BandDisclaimer tone="light" className="mt-4" />
      </div>

      {underLength && (
        <div className="rounded-xl border border-[#ecdcab] bg-badge-bg px-4 py-3 font-sans text-[13px] leading-relaxed text-badge-text">
          This essay is under {TASK2_MIN_WORDS} words, which lowers Task Response in the real exam.
        </div>
      )}

      {essay.summary && (
        <Section title="Summary">
          <p className="font-sans text-[14.5px] leading-relaxed text-ink">{essay.summary}</p>
        </Section>
      )}

      <Section title="The four criteria">
        <div className="flex flex-col gap-5">
          {CRITERIA.map((c) => (
            <CriterionBar key={c.key} label={c.label} short={c.short} band={bands[c.key]} note={essay.criteria_notes?.[c.key]} />
          ))}
        </div>
        <BandDisclaimer className="mt-5" />
      </Section>

      <Section title={`Grammar & language notes${flags.length ? ` (${flags.length})` : ""}`}>
        {flags.length === 0 ? (
          <p className="font-sans text-sm text-muted">No major language errors were flagged in this essay.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-cream-alt">
            {flags.map((f, i) => (
              <li key={`${f.excerpt}-${i}`} className="py-3.5 first:pt-0 last:pb-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-sans text-[11px] font-bold tabular-nums text-meta">{i + 1}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 font-sans text-[11px] font-bold capitalize ${CATEGORY_STYLES[f.category] ?? CATEGORY_STYLES.grammar}`}>
                    {f.category}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans text-[14px]">
                  <span className="text-[#9a3434] line-through decoration-[#9a3434]/50">{f.excerpt}</span>
                  <span aria-hidden="true" className="text-meta">→</span>
                  <span className="sr-only">should be</span>
                  <span className="font-semibold text-[#2f6b2a]">{f.suggestion}</span>
                </div>
                {f.issue && <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted">{f.issue}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {steps.length > 0 && (
        <Section title="What to practise next">
          <ul className="flex flex-col gap-2">
            {steps.map((s) => (
              <li key={s} className="flex gap-2 font-sans text-[14px] leading-relaxed text-ink">
                <span className="text-gold">—</span>
                {s}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {reviews.length > 0 && (
        <Section title="Teacher feedback">
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-l-[3px] border-gold pl-4">
                <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12.5px] text-meta">
                  <span className="font-semibold text-navy">{r.teacher_name || "Your teacher"}</span>
                  <span>{formatDate(r.created_at)}</span>
                  {r.overall_band !== null && (
                    <span className="rounded-full bg-badge-bg px-2 py-0.5 font-bold text-badge-text">
                      Teacher band {formatBand(r.overall_band)}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-line font-sans text-[14px] leading-relaxed text-ink">{r.comment}</p>
              </div>
            ))}
          </div>
          {reviews.some((r) => r.overall_band !== null) && <BandDisclaimer className="mt-4" />}
        </Section>
      )}

      {showTeacherButton && <SendToTeacher essayId={essay.id} status={essay.review_status} />}

      {showHistoryLink && (
        <Link href="/writing/history" className="font-sans text-[13px] font-semibold">
          See all my essays →
        </Link>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] border border-border-soft bg-white p-6">
      <h3 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{title}</h3>
      {children}
    </section>
  );
}
