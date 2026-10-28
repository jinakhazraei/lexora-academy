import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { BandDisclaimer, BandPill } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { formatDate as formatDateIn } from "@/i18n/config";
import { getLang } from "@/i18n/server";
import { setAssignment } from "@/lib/actions/teacher";
import { firstName, requireStaff } from "@/lib/auth";
import { SKILLS, formatBand } from "@/lib/ielts";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Skill, SkillScoreRow } from "@/lib/types";

export const metadata: Metadata = { title: "Teacher Area — Lexora Academy", robots: { index: false } };

// The teacher area is in English (see layout.tsx).
const formatDate = (iso: string) => formatDateIn(iso, "en");

type QueueItem = {
  id: string;
  prompt_text: string;
  overall_band: number;
  word_count: number;
  review_note: string | null;
  review_requested_at: string | null;
  student: Pick<Profile, "id" | "full_name" | "email" | "teacher_id"> | null;
};

export default async function TeacherPage(props: PageProps<"/[lang]/teacher">) {
  const lang = await getLang();
  const teacher = await requireStaff(`/${lang}/teacher`);
  const params = await props.searchParams;
  const mineOnly = params.filter === "mine";
  const supabase = await createClient();

  const [queueRes, studentsRes, scoresRes, myReviewsRes] = await Promise.all([
    supabase
      .from("essays")
      .select("id, prompt_text, overall_band, word_count, review_note, review_requested_at, student:profiles(id, full_name, email, teacher_id)")
      .eq("review_status", "requested")
      .order("review_requested_at", { ascending: true })
      .limit(100),
    supabase.from("profiles").select("*").eq("role", "student").order("full_name"),
    supabase.from("skill_scores").select("student_id, skill, band, taken_on, created_at").order("taken_on").order("created_at"),
    supabase
      .from("teacher_reviews")
      .select("id, essay_id, created_at, overall_band, essays(prompt_text, student:profiles(full_name))")
      .eq("teacher_id", teacher.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allQueue = (queueRes.data ?? []) as unknown as QueueItem[];
  const queue = mineOnly ? allQueue.filter((q) => q.student?.teacher_id === teacher.id) : allQueue;
  const students = (studentsRes.data ?? []) as Profile[];
  const visibleStudents = mineOnly ? students.filter((s) => s.teacher_id === teacher.id) : students;

  const latest = new Map<string, Partial<Record<Skill, number>>>();
  const lastActive = new Map<string, string>();
  for (const s of (scoresRes.data ?? []) as Pick<SkillScoreRow, "student_id" | "skill" | "band" | "taken_on">[]) {
    const entry = latest.get(s.student_id) ?? {};
    entry[s.skill] = s.band;
    latest.set(s.student_id, entry);
    lastActive.set(s.student_id, s.taken_on);
  }

  type MyReview = { id: string; essay_id: string; created_at: string; overall_band: number | null; essays: { prompt_text: string; student: { full_name: string } | null } | null };
  const myReviews = (myReviewsRes.data ?? []) as unknown as MyReview[];

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-3">Teacher Area</Eyebrow>
            <h1 className="mb-2 font-display text-[32px] font-semibold text-navy md:text-[40px]">Hello, {firstName(teacher.profile) ?? "there"}</h1>
            <p className="font-sans text-[15px] text-muted">
              {allQueue.length === 0
                ? "No essays waiting for review."
                : `${allQueue.length} ${allQueue.length === 1 ? "essay is" : "essays are"} waiting for review.`}
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border-soft bg-white p-1 font-sans text-[13px] font-semibold">
            <Link href="/teacher" className={`rounded-md px-3.5 py-2 ${!mineOnly ? "bg-navy text-white hover:text-white" : "text-navy"}`}>
              All students
            </Link>
            <Link href="/teacher?filter=mine" className={`rounded-md px-3.5 py-2 ${mineOnly ? "bg-navy text-white hover:text-white" : "text-navy"}`}>
              My students
            </Link>
          </div>
        </div>

        {/* Review queue */}
        <section className="mb-8 rounded-[20px] border border-border-soft bg-white p-6">
          <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
            Review requests {queue.length > 0 && <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-navy">{queue.length}</span>}
          </h2>
          {queue.length === 0 ? (
            <p className="font-sans text-sm text-muted">
              {mineOnly ? "None of your students are waiting right now." : "You're all caught up."}
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-cream-alt">
              {queue.map((q) => (
                <li key={q.id}>
                  <Link href={`/teacher/essays/${q.id}`} className="group flex items-start gap-4 py-3.5 text-ink hover:text-ink">
                    <BandPill band={q.overall_band} className="mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-3 font-sans text-[14px]">
                        <span className="font-bold text-navy group-hover:text-gold">{q.student?.full_name || q.student?.email || "Student"}</span>
                        <span className="text-[12px] text-meta">
                          asked {q.review_requested_at ? formatDate(q.review_requested_at) : ""} · {q.word_count} words
                        </span>
                      </div>
                      <div className="truncate font-sans text-[13px] text-muted">{q.prompt_text}</div>
                      {q.review_note && (
                        <div className="mt-1 line-clamp-2 font-sans text-[13px] italic text-ink">&ldquo;{q.review_note}&rdquo;</div>
                      )}
                    </div>
                    <span aria-hidden="true" className="mt-1 text-meta group-hover:text-gold">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <BandDisclaimer className="mt-4" />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Students */}
          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
              {mineOnly ? "My students" : "All students"} ({visibleStudents.length})
            </h2>
            {visibleStudents.length === 0 ? (
              <p className="font-sans text-sm text-muted">
                {mineOnly ? "Assign students to yourself from the All students tab." : "No students have signed up yet."}
              </p>
            ) : (
              <div className="-mx-2 overflow-x-auto px-2">
                <table className="w-full min-w-[620px] border-collapse text-left font-sans text-[13.5px]">
                  <thead>
                    <tr className="border-b border-border-soft text-[11.5px] uppercase tracking-wide text-meta">
                      <th scope="col" className="py-2.5 pr-3 font-bold">Student</th>
                      {SKILLS.map((s) => (
                        <th key={s.key} scope="col" className="py-2.5 pr-3 text-center font-bold" title={s.label}>
                          {s.label.slice(0, 1)}
                        </th>
                      ))}
                      <th scope="col" className="py-2.5 pr-3 font-bold">Target</th>
                      <th scope="col" className="py-2.5 font-bold">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleStudents.map((s) => {
                      const bands = latest.get(s.id) ?? {};
                      const mine = s.teacher_id === teacher.id;
                      return (
                        <tr key={s.id} className="border-b border-cream-alt last:border-b-0">
                          <td className="py-2.5 pr-3">
                            <Link href={`/teacher/students/${s.id}`} className="font-semibold">
                              {s.full_name || s.email}
                            </Link>
                            <div className="text-[12px] text-meta">
                              {lastActive.get(s.id) ? `Last score ${formatDate(lastActive.get(s.id)!)}` : "No scores yet"}
                            </div>
                          </td>
                          {SKILLS.map((k) => (
                            <td key={k.key} className="py-2.5 pr-3 text-center font-bold tabular-nums text-navy">
                              {formatBand(bands[k.key])}
                            </td>
                          ))}
                          <td className="py-2.5 pr-3 tabular-nums text-muted">{formatBand(s.target_band)}</td>
                          <td className="py-2.5">
                            {mine ? (
                              <span className="rounded-full bg-badge-bg px-2 py-0.5 text-[12px] font-bold text-badge-text">You</span>
                            ) : s.teacher_id ? (
                              <span className="text-[12px] text-meta">Assigned</span>
                            ) : (
                              <form action={setAssignment}>
                                <input type="hidden" name="student_id" value={s.id} />
                                <input type="hidden" name="assign" value="1" />
                                <button type="submit" className="cursor-pointer text-[12.5px] font-semibold text-gold hover:text-navy">
                                  Assign to me
                                </button>
                              </form>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-4 font-sans text-[12px] text-meta">L · R · W · S = latest Listening, Reading, Writing, Speaking band.</p>
            <BandDisclaimer className="mt-1" />
          </section>

          {/* Recently reviewed */}
          <section className="rounded-[20px] border border-border-soft bg-white p-6">
            <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Recently reviewed by you</h2>
            {myReviews.length === 0 ? (
              <p className="font-sans text-sm text-muted">Your reviews will be listed here.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {myReviews.map((r) => (
                  <li key={r.id}>
                    <Link href={`/teacher/essays/${r.essay_id}`} className="font-sans text-[13.5px] font-semibold">
                      {r.essays?.student?.full_name || "Student"}
                    </Link>
                    <div className="truncate font-sans text-[12.5px] text-muted">{r.essays?.prompt_text}</div>
                    <div className="font-sans text-[12px] text-meta">
                      {formatDate(r.created_at)}
                      {r.overall_band !== null && ` · band ${formatBand(r.overall_band)}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
