import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeacherScoreForm } from "@/app/[lang]/teacher/TeacherForms";
import { ScoreHistory } from "@/components/dashboard/ScoreHistory";
import { SkillCard } from "@/components/dashboard/SkillCard";
import { EssayList } from "@/components/EssayList";
import Link from "@/components/LocaleLink";
import { BandDisclaimer } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { formatDate as formatDateIn, localeNames } from "@/i18n/config";
import { getLang } from "@/i18n/server";
import { setAssignment } from "@/lib/actions/teacher";
import { hasCurrentConsent, requireStaff } from "@/lib/auth";
import { formatBand } from "@/lib/ielts";
import { overallEstimate, summarizeProgress } from "@/lib/progress";
import { getProfile, listEssays, listSkillScores } from "@/lib/queries";

export const metadata: Metadata = { title: "Student — Lexora Academy", robots: { index: false } };

const formatDate = (iso: string) => formatDateIn(iso, "en");

export default async function TeacherStudentPage(props: PageProps<"/[lang]/teacher/students/[id]">) {
  const lang = await getLang();
  const { id } = await props.params;
  const teacher = await requireStaff(`/${lang}/teacher/students/${id}`);
  const student = await getProfile(id);
  if (!student || student.role !== "student") notFound();

  const [scores, essays] = await Promise.all([listSkillScores(id), listEssays(id, 50)]);
  const progress = summarizeProgress(scores);
  const overall = overallEstimate(progress);
  const mine = student.teacher_id === teacher.id;

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1320px]">
        <Link href="/teacher" className="mb-6 inline-block font-sans text-[13px] font-semibold">
          ← Teacher area
        </Link>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-3">Student</Eyebrow>
            <h1 className="mb-2 font-display text-[32px] font-semibold text-navy md:text-[38px]">{student.full_name || student.email}</h1>
            <p className="font-sans text-[14px] text-muted">
              {student.email} · joined {formatDate(student.created_at)}
              {student.test_date && ` · test on ${formatDate(student.test_date)}`}
              {student.locale && ` · uses the site in ${localeNames[student.locale]?.native ?? student.locale}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-navy px-4 py-2.5 text-center">
              <div className="font-sans text-[11px] font-bold uppercase tracking-wide text-gold-light">Overall est.</div>
              <div className="font-display text-2xl font-semibold tabular-nums text-white">{formatBand(overall)}</div>
            </div>
            <form action={setAssignment}>
              <input type="hidden" name="student_id" value={student.id} />
              <input type="hidden" name="assign" value={mine ? "0" : "1"} />
              <button
                type="submit"
                disabled={!mine && Boolean(student.teacher_id) && teacher.profile.role !== "admin"}
                className="cursor-pointer rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mine ? "Remove from my students" : student.teacher_id ? "Assigned to another teacher" : "Assign to me"}
              </button>
            </form>
          </div>
        </div>

        {!hasCurrentConsent(student) && (
          <div className="mb-6 rounded-lg border border-[#ecdcab] bg-badge-bg px-4 py-3 font-sans text-[13px] text-badge-text">
            This student hasn&apos;t accepted the current Privacy Policy, so new essays can&apos;t be saved until they do.
          </div>
        )}

        <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {progress.map((p) => (
            <SkillCard key={p.skill} progress={p} target={student.target_band === null ? null : Number(student.target_band)} showActions={false} />
          ))}
        </div>
        <BandDisclaimer className="mb-8" />

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <h2 className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Essays ({essays.length})</h2>
            <EssayList essays={essays} hrefBase="/teacher/essays" emptyText="No essays yet." />
          </section>
          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <h2 className="mb-1 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Record a teacher score</h2>
            <p className="mb-5 font-sans text-[13px] text-muted">
              Mock tests you marked — Speaking, Listening, Reading or Writing. They show on the student&apos;s dashboard as
              teacher-assessed.
            </p>
            <TeacherScoreForm studentId={student.id} />
          </section>
        </div>

        <section className="rounded-[20px] border border-border-soft bg-white p-6">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">All scores ({scores.length})</h2>
          <ScoreHistory scores={scores} canDelete={false} essayHrefBase="/teacher/essays" />
        </section>
      </div>
    </div>
  );
}
