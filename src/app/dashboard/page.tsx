import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogScoreForm } from "@/components/dashboard/LogScoreForm";
import { PrivacyBanner } from "@/components/dashboard/PrivacyBanner";
import { ScoreHistory } from "@/components/dashboard/ScoreHistory";
import { SkillCard } from "@/components/dashboard/SkillCard";
import { EssayList } from "@/components/EssayList";
import { BandDisclaimer, BandMeter } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { formatDate } from "@/components/writing/ResultsPanel";
import { firstName, hasCurrentConsent, isStaff, requireUser } from "@/lib/auth";
import { CRITERIA, formatBand } from "@/lib/ielts";
import { daysUntil, overallEstimate, summarizeProgress } from "@/lib/progress";
import { listEssays, listRecentReviewsForStudent, listSkillScores } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import type { EssayRow } from "@/lib/types";

export const metadata: Metadata = { title: "My Dashboard — Lexora Academy" };

type CriteriaRow = Pick<EssayRow, "task_response" | "coherence_cohesion" | "lexical_resource" | "grammar_accuracy">;

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  if (isStaff(user.profile)) redirect("/teacher");
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
  const target = profile.target_band;
  const missing = progress.filter((p) => !p.latest).map((p) => p.label);

  // The skill furthest below target (or the lowest, with no target) is the one to focus on.
  const scored = progress.filter((p) => p.latest);
  const focus =
    scored.length > 0
      ? [...scored].sort((a, b) => (a.latest!.band - (target ?? 0)) - (b.latest!.band - (target ?? 0)))[0]
      : null;

  const daysToTest = daysUntil(profile.test_date);

  const criteriaRows = (recentCriteria.data ?? []) as CriteriaRow[];
  const criteriaAvg =
    criteriaRows.length > 0
      ? CRITERIA.map((c) => ({
          ...c,
          avg:
            criteriaRows.reduce((sum, r) => sum + Number(r[c.column as keyof CriteriaRow]), 0) / criteriaRows.length,
        }))
      : [];
  const weakest = criteriaAvg.length ? [...criteriaAvg].sort((a, b) => a.avg - b.avg)[0] : null;

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1320px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-3">Student Dashboard</Eyebrow>
            <h1 className="mb-2 font-display text-[32px] font-semibold text-navy md:text-[40px]">
              Welcome back, {firstName(profile)}
            </h1>
            <p className="font-sans text-[15px] text-muted">Your progress across all four IELTS skills.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/account" className="rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white">
              Account settings
            </Link>
            <Link href="/writing" className="rounded-lg bg-gold px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:text-navy hover:brightness-95">
              Write an essay
            </Link>
          </div>
        </div>

        {params.password === "updated" && (
          <div role="status" className="mb-6 rounded-lg border border-[#cfe3c9] bg-[#f1f8ee] px-4 py-3 font-sans text-[13px] font-semibold text-[#2f6b2a]">
            Your password has been updated.
          </div>
        )}
        {!hasCurrentConsent(profile) && <PrivacyBanner />}

        {/* KPI row */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-[20px] bg-[linear-gradient(160deg,#0A1428,#1B2C52_70%,#0F1B33)] p-5">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-gold-light">Overall estimate</div>
            <div className="font-display text-[48px] font-semibold leading-none tabular-nums text-white">{formatBand(overall)}</div>
            <p className="mt-2 font-sans text-[12.5px] leading-snug text-white/60">
              {overall === null
                ? `Add ${missing.join(", ").replace(/, ([^,]*)$/, " and $1")} to see it.`
                : "Average of your latest band in each skill."}
            </p>
            <BandDisclaimer tone="light" className="mt-3" />
          </div>

          <div className="rounded-[20px] border border-border-soft bg-white p-5">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-badge-text">Target band</div>
            <div className="font-display text-[48px] font-semibold leading-none tabular-nums text-navy">{formatBand(target)}</div>
            <p className="mt-2 font-sans text-[12.5px] leading-snug text-muted">
              {daysToTest !== null && daysToTest >= 0
                ? `${daysToTest} ${daysToTest === 1 ? "day" : "days"} until your test (${formatDate(profile.test_date!)})`
                : target
                  ? "Add your test date in account settings."
                  : (
                    <Link href="/account" className="font-semibold">
                      Set your target band →
                    </Link>
                  )}
            </p>
          </div>

          <div className="rounded-[20px] border border-border-soft bg-white p-5">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-badge-text">Essays written</div>
            <div className="font-display text-[48px] font-semibold leading-none tabular-nums text-navy">{essayCount.count ?? 0}</div>
            <p className="mt-2 font-sans text-[12.5px] leading-snug text-muted">
              {reviews.length > 0 ? `${reviews.length} recent teacher ${reviews.length === 1 ? "review" : "reviews"}` : "Send any essay to your teacher for review."}
            </p>
          </div>

          <div className="rounded-[20px] border border-border-soft bg-white p-5">
            <div className="mb-2 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-badge-text">Focus next</div>
            {focus ? (
              <>
                <div className="font-display text-[30px] font-semibold leading-tight text-navy">{focus.label}</div>
                <p className="mt-2 font-sans text-[12.5px] leading-snug text-muted">
                  {target && focus.latest!.band < target
                    ? `${(target - focus.latest!.band).toFixed(1)} below your target — your biggest gap.`
                    : target
                      ? "You're at or above target in every skill. Keep it steady!"
                      : "Your lowest skill right now."}
                  {weakest && focus.skill === "writing" && ` Work on ${weakest.label}.`}
                </p>
              </>
            ) : (
              <p className="mt-1 font-sans text-[13px] leading-relaxed text-muted">
                Log a practice test or write an essay and we&apos;ll show where to focus.
              </p>
            )}
          </div>
        </div>

        {/* Four skills */}
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-[22px] font-semibold text-navy">Your four skills</h2>
          <span className="hidden items-center gap-2 font-sans text-[12px] text-meta sm:flex">
            <span className="inline-block h-3 w-[3px] rounded-full bg-gold" /> target band
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Recent essays</h2>
              <Link href="/writing/history" className="font-sans text-[13px] font-semibold">
                All essays →
              </Link>
            </div>
            <EssayList essays={essays} emptyText="No essays yet — write your first Task 2 essay to get an estimated band." />
            {criteriaAvg.length > 0 && (
              <div className="mt-5 border-t border-cream-alt pt-5">
                <div className="mb-3 font-sans text-[12.5px] font-semibold text-navy">
                  Writing criteria · average of your last {criteriaRows.length} {criteriaRows.length === 1 ? "essay" : "essays"}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {criteriaAvg.map((c) => (
                    <div key={c.key}>
                      <div className="mb-1 flex justify-between font-sans text-[12.5px]">
                        <span className={c.key === weakest?.key ? "font-bold text-navy" : "text-muted"}>
                          {c.label}
                          {c.key === weakest?.key && " · focus"}
                        </span>
                        <span className="font-bold tabular-nums text-navy">{c.avg.toFixed(1)}</span>
                      </div>
                      <BandMeter value={c.avg} label={`${c.label} average`} height={6} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Teacher feedback</h2>
            {reviews.length === 0 ? (
              <p className="font-sans text-sm leading-relaxed text-muted">
                When your teacher reviews an essay, their comments appear here. Use &ldquo;Send to my teacher&rdquo; on any
                essay result.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-l-[3px] border-gold pl-4">
                    <div className="mb-1 flex flex-wrap items-center gap-x-3 font-sans text-[12px] text-meta">
                      <span className="font-semibold text-navy">{r.teacher_name || "Your teacher"}</span>
                      <span>{formatDate(r.created_at)}</span>
                      {r.overall_band !== null && <span className="font-bold text-badge-text">Band {formatBand(r.overall_band)}</span>}
                    </div>
                    <p className="line-clamp-3 font-sans text-[13.5px] leading-relaxed text-ink">{r.comment}</p>
                    <Link href={`/writing/history/${r.essay_id}`} className="mt-1 inline-block font-sans text-[12.5px] font-semibold">
                      Open essay →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Log a practice test */}
        <section id="log-score" className="mb-6 scroll-mt-28 rounded-[20px] border border-border-soft bg-white p-6">
          <h2 className="mb-1 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Log a practice test</h2>
          <p className="mb-5 font-sans text-[13px] text-muted">
            Did a Listening or Reading practice test, or a mock Speaking? Add your band to track it here.
          </p>
          <LogScoreForm />
        </section>

        <details className="group rounded-[20px] border border-border-soft bg-white p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
            All scores ({scores.length})
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
