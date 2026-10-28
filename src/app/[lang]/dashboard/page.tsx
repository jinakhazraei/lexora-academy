import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "@/components/LocaleLink";
import { LogScoreForm } from "@/components/dashboard/LogScoreForm";
import { PrivacyBanner } from "@/components/dashboard/PrivacyBanner";
import { ScoreHistory } from "@/components/dashboard/ScoreHistory";
import { SkillCard } from "@/components/dashboard/SkillCard";
import { EssayList } from "@/components/EssayList";
import { BandDisclaimer, BandMeter } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { fmt, formatDate } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { firstName, hasCurrentConsent, isStaff, requireUser } from "@/lib/auth";
import { CRITERIA, formatBand } from "@/lib/ielts";
import { daysUntil, overallEstimate, summarizeProgress } from "@/lib/progress";
import { listEssays, listRecentReviewsForStudent, listSkillScores } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { EssayRow } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.dashboard, robots: { index: false } };
}

type CriteriaRow = Pick<EssayRow, "task_response" | "coherence_cohesion" | "lexical_resource" | "grammar_accuracy">;

/** "Listening, Reading and Speaking" in the page's language. */
function joinList(items: string[], and: string) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ${and} ${items.at(-1)}`;
}

export default async function DashboardPage(props: PageProps<"/[lang]/dashboard">) {
  const { lang, t } = await getI18n();
  const d = t.dashboard;
  const user = await requireUser(`/${lang}/dashboard`);
  if (isStaff(user.profile)) redirect(`/${lang}/teacher`);
  const params = await props.searchParams;
  const profile = user.profile;

  const supabase = await createClient();
  const [scores, essays, reviews, essayCount, recentCriteria] = await Promise.all([
    listSkillScores(user.id),
    listEssays(user.id, 5),
    listRecentReviewsForStudent(user.id, 3),
    supabase.from("essays").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase
      .from("essays")
      .select("task_response, coherence_cohesion, lexical_resource, grammar_accuracy")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const progress = summarizeProgress(scores);
  const overall = overallEstimate(progress);
  const target = profile.target_band === null ? null : Number(profile.target_band);
  const missing = progress.filter((p) => !p.latest).map((p) => t.skills[p.skill]);

  // The skill furthest below target (or the lowest, with no target) is the one to focus on.
  const scored = progress.filter((p) => p.latest);
  const focus =
    scored.length > 0
      ? [...scored].sort((a, b) => Number(a.latest!.band) - (target ?? 0) - (Number(b.latest!.band) - (target ?? 0)))[0]
      : null;
  const focusBand = focus ? Number(focus.latest!.band) : null;

  const daysToTest = daysUntil(profile.test_date);

  const criteriaRows = (recentCriteria.data ?? []) as CriteriaRow[];
  const criteriaAvg =
    criteriaRows.length > 0
      ? CRITERIA.map((c) => ({
          key: c.key,
          label: t.criteria[c.key],
          avg: criteriaRows.reduce((sum, r) => sum + Number(r[c.column as keyof CriteriaRow]), 0) / criteriaRows.length,
        }))
      : [];
  const weakest = criteriaAvg.length ? [...criteriaAvg].sort((a, b) => a.avg - b.avg)[0] : null;

  const kpiLabel = "mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-badge-text";

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1320px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-3">{d.eyebrow}</Eyebrow>
            <h1 className="mb-2 font-display text-[32px] font-semibold text-navy md:text-[40px]">
              {fmt(d.welcome, { name: firstName(profile) ?? d.fallbackName })}
            </h1>
            <p className="font-sans text-[15px] text-muted">{d.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/account" className="rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white">
              {d.accountSettings}
            </Link>
            <Link href="/writing" className="rounded-lg bg-gold px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:text-navy hover:brightness-95">
              {d.writeEssay}
            </Link>
          </div>
        </div>

        {params.password === "updated" && (
          <div role="status" className="mb-6 rounded-lg border border-[#cfe3c9] bg-[#f1f8ee] px-4 py-3 font-sans text-[13px] font-semibold text-[#2f6b2a]">
            {d.passwordUpdated}
          </div>
        )}
        {!hasCurrentConsent(profile) && <PrivacyBanner />}

        {/* KPI row */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,#0A1428,#1B2C52_70%,#0F1B33)] p-5">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-gold-light">{d.overall}</div>
            <div className="font-display text-[48px] font-semibold leading-none tabular-nums text-white">{formatBand(overall)}</div>
            <p className="mt-2 font-sans text-[12.5px] leading-snug text-white/60">
              {overall === null ? fmt(d.overallMissing, { skills: joinList(missing, d.and) }) : d.overallHow}
            </p>
            <BandDisclaimer tone="light" className="mt-3" />
          </div>

          <div className="rounded-[20px] border border-border-soft bg-white p-5">
            <div className={kpiLabel}>{d.target}</div>
            <div className="font-display text-[48px] font-semibold leading-none tabular-nums text-navy">{formatBand(target)}</div>
            <p className="mt-2 font-sans text-[12.5px] leading-snug text-muted">
              {daysToTest !== null && daysToTest >= 0 ? (
                fmt(daysToTest === 1 ? d.dayToTest : d.daysToTest, { days: daysToTest, date: formatDate(profile.test_date!, lang) })
              ) : target ? (
                d.addTestDate
              ) : (
                <Link href="/account" className="font-semibold">
                  {d.setTarget}
                </Link>
              )}
            </p>
          </div>

          <div className="rounded-[20px] border border-border-soft bg-white p-5">
            <div className={kpiLabel}>{d.essaysWritten}</div>
            <div className="font-display text-[48px] font-semibold leading-none tabular-nums text-navy">{essayCount.count ?? 0}</div>
            <p className="mt-2 font-sans text-[12.5px] leading-snug text-muted">
              {reviews.length === 0 ? d.sendAny : reviews.length === 1 ? d.recentReview : fmt(d.recentReviews, { count: reviews.length })}
            </p>
          </div>

          <div className="rounded-[20px] border border-border-soft bg-white p-5">
            <div className={kpiLabel}>{d.focus}</div>
            {focus && focusBand !== null ? (
              <>
                <div className="font-display text-[30px] font-semibold leading-tight text-navy">{t.skills[focus.skill]}</div>
                <p className="mt-2 font-sans text-[12.5px] leading-snug text-muted">
                  {target && focusBand < target
                    ? fmt(d.focusBelow, { gap: (target - focusBand).toFixed(1) })
                    : target
                      ? d.focusAtTarget
                      : d.focusLowest}
                  {weakest && focus.skill === "writing" && ` ${fmt(d.focusCriterion, { criterion: weakest.label })}`}
                </p>
              </>
            ) : (
              <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted">{d.focusEmpty}</p>
            )}
          </div>
        </div>

        {/* Four skills */}
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-[22px] font-semibold text-navy">{d.fourSkills}</h2>
          <span className="hidden items-center gap-2 font-sans text-[12px] text-meta sm:flex">
            <span className="inline-block h-3 w-[3px] rounded-full bg-gold" /> {d.targetLegend}
          </span>
        </div>
        <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {progress.map((p) => (
            <SkillCard key={p.skill} progress={p} target={target} />
          ))}
        </div>
        <BandDisclaimer className="mb-10" />

        {/* Essays + feedback */}
        <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <h2 className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{d.recentEssays}</h2>
              <Link href="/writing/history" className="font-sans text-[13px] font-semibold">
                {d.allEssays}
              </Link>
            </div>
            <EssayList essays={essays} emptyText={d.noEssays} />
            {criteriaAvg.length > 0 && (
              <div className="mt-5 border-t border-cream-alt pt-5">
                <div className="mb-3 font-sans text-[12.5px] font-semibold text-navy">
                  {criteriaRows.length === 1 ? d.criteriaAverageOne : fmt(d.criteriaAverage, { count: criteriaRows.length })}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {criteriaAvg.map((c) => (
                    <div key={c.key}>
                      <div className="mb-1 flex justify-between gap-2 font-sans text-[12.5px]">
                        <span className={c.key === weakest?.key ? "font-bold text-navy" : "text-muted"}>
                          {c.label}
                          {c.key === weakest?.key && ` · ${d.focusTag}`}
                        </span>
                        <span className="font-bold tabular-nums text-navy">{c.avg.toFixed(1)}</span>
                      </div>
                      <BandMeter value={c.avg} label={fmt(t.scores.average, { label: c.label })} height={6} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{d.teacherFeedback}</h2>
            {reviews.length === 0 ? (
              <p className="font-sans text-sm leading-relaxed text-muted">{d.noTeacherFeedback}</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-l-[3px] border-gold pl-4">
                    <div className="mb-1 flex flex-wrap items-center gap-x-3 font-sans text-[12px] text-meta">
                      <span className="font-semibold text-navy">{r.teacher_name || d.yourTeacher}</span>
                      <span>{formatDate(r.created_at, lang)}</span>
                      {r.overall_band !== null && (
                        <span className="font-bold text-badge-text">{fmt(d.band, { band: formatBand(r.overall_band) })}</span>
                      )}
                    </div>
                    <p className="line-clamp-3 font-sans text-[13.5px] leading-relaxed text-ink">{r.comment}</p>
                    <Link href={`/writing/history/${r.essay_id}`} className="mt-1 inline-block font-sans text-[12.5px] font-semibold">
                      {d.openEssay}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Log a practice test */}
        <section id="log-score" className="mb-6 scroll-mt-28 rounded-[20px] border border-border-soft bg-white p-6">
          <h2 className="mb-1 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{d.logTitle}</h2>
          <p className="mb-5 font-sans text-[13px] text-muted">{d.logIntro}</p>
          <LogScoreForm />
        </section>

        <details className="group rounded-[20px] border border-border-soft bg-white p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
            {fmt(d.allScores, { count: scores.length })}
            <span className="text-lg text-gold transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="mt-5">
            <ScoreHistory scores={scores} />
          </div>
        </details>
      </div>
    </div>
  );
}
