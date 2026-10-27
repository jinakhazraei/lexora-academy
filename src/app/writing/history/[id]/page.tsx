import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEssay } from "@/app/writing/actions";
import { SubmitButton } from "@/components/forms";
import { ResultsPanel, formatDate } from "@/components/writing/ResultsPanel";
import { EssayText } from "@/components/writing/EssayText";
import { requireUser } from "@/lib/auth";
import { getEssay } from "@/lib/queries";

export const metadata: Metadata = { title: "Essay Feedback — Lexora Academy" };

export default async function EssayDetailPage(props: PageProps<"/writing/history/[id]">) {
  const { id } = await props.params;
  const user = await requireUser(`/writing/history/${id}`);
  const data = await getEssay(id);
  if (!data || data.essay.student_id !== user.id) notFound();
  const { essay, reviews } = data;

  return (
    <div className="bg-cream px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1240px]">
        <Link href="/writing/history" className="mb-6 inline-block font-sans text-[13px] font-semibold">
          ← My essays
        </Link>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <section className="rounded-[20px] border border-border-soft bg-white p-6">
              <div className="mb-1.5 font-sans text-[11px] font-bold uppercase tracking-wide text-badge-text">
                Task 2 · {formatDate(essay.created_at)}
              </div>
              <p className="font-display text-[18px] leading-relaxed text-navy">{essay.prompt_text}</p>
            </section>
            <section className="rounded-[20px] border border-border-soft bg-white p-6">
              <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">Your essay</h2>
              <EssayText body={essay.body} flags={essay.grammar_flags} />
            </section>
            <form action={deleteEssay} className="flex items-center gap-3">
              <input type="hidden" name="essay_id" value={essay.id} />
              <SubmitButton variant="outline-navy" pendingLabel="Deleting…" className="!px-4 !py-2.5 !text-[12.5px]">
                Delete this essay
              </SubmitButton>
              <span className="font-sans text-[12px] text-meta">Removes the essay, its feedback and its scores.</span>
            </form>
          </div>

          <div className="lg:sticky lg:top-28">
            <ResultsPanel
              essay={essay}
              reviews={reviews.map((r) => ({ ...r, teacher_name: r.teacher_name }))}
              showTeacherButton
            />
          </div>
        </div>
      </div>
    </div>
  );
}
