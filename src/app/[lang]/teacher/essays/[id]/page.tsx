import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewForm } from "@/app/[lang]/teacher/TeacherForms";
import Link from "@/components/LocaleLink";
import { EssayText } from "@/components/writing/EssayText";
import { ResultsPanel } from "@/components/writing/ResultsPanel";
import { formatDate } from "@/i18n/config";
import { getLang } from "@/i18n/server";
import { requireStaff } from "@/lib/auth";
import { getEssay, getProfile } from "@/lib/queries";

export const metadata: Metadata = { title: "Review Essay — Lexora Academy", robots: { index: false } };

export default async function TeacherEssayPage(props: PageProps<"/[lang]/teacher/essays/[id]">) {
  const lang = await getLang();
  const { id } = await props.params;
  await requireStaff(`/${lang}/teacher/essays/${id}`);
  const data = await getEssay(id);
  if (!data) notFound();
  const { essay, reviews } = data;
  const student = await getProfile(essay.student_id);

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1320px]">
        <Link href="/teacher" className="mb-6 inline-block font-sans text-[13px] font-semibold">
          ← Teacher area
        </Link>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-badge-text">
              Task 2 · submitted {formatDate(essay.created_at, "en")}
            </div>
            <h1 className="font-display text-[28px] font-semibold text-navy md:text-[34px]">
              {student ? (
                <Link href={`/teacher/students/${student.id}`} className="text-navy hover:text-gold">
                  {student.full_name || student.email}
                </Link>
              ) : (
                "Student essay"
              )}
            </h1>
          </div>
          {essay.review_status === "requested" && (
            <span className="rounded-full bg-gold px-3 py-1 font-sans text-[12px] font-bold text-navy">Waiting for review</span>
          )}
          {essay.review_status === "reviewed" && (
            <span className="rounded-full bg-[#f1f8ee] px-3 py-1 font-sans text-[12px] font-bold text-[#2f6b2a]">Reviewed</span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <section className="rounded-[20px] border border-border-soft bg-white p-6">
              <p className="font-display text-[18px] leading-relaxed text-navy">{essay.prompt_text}</p>
            </section>
            {essay.review_note && (
              <section className="rounded-[20px] border border-[#ecdcab] bg-[#fffaf0] p-5">
                <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-wide text-badge-text">Student&apos;s note</div>
                <p className="font-sans text-[14px] italic leading-relaxed text-ink">&ldquo;{essay.review_note}&rdquo;</p>
              </section>
            )}
            <section className="rounded-[20px] border border-border-soft bg-white p-6">
              <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
                Essay · {essay.word_count} words
              </h2>
              <EssayText body={essay.body} flags={essay.grammar_flags} />
            </section>
            <section className="rounded-[20px] border-2 border-gold/60 bg-white p-6">
              <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">
                {reviews.length > 0 ? "Add another review" : "Your review"}
              </h2>
              <ReviewForm essayId={essay.id} aiBand={essay.overall_band} />
            </section>
          </div>

          <div className="lg:sticky lg:top-28">
            <div className="mb-3 font-sans text-[12px] font-bold uppercase tracking-[0.12em] text-meta">
              AI feedback the student saw · {essay.scorer}
            </div>
            <ResultsPanel essay={essay} reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
