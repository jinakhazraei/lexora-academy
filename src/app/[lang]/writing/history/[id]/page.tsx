import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/LocaleLink";
import { SubmitButton } from "@/components/forms";
import { ResultsPanel } from "@/components/writing/ResultsPanel";
import { EssayText } from "@/components/writing/EssayText";
import { fmt, formatDate } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { deleteEssay } from "@/lib/actions/writing";
import { requireUser } from "@/lib/auth";
import { getEssay } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.essay, robots: { index: false } };
}

export default async function EssayDetailPage(props: PageProps<"/[lang]/writing/history/[id]">) {
  const { lang, t } = await getI18n();
  const h = t.history;
  const { id } = await props.params;
  const user = await requireUser(`/${lang}/writing/history/${id}`);
  const data = await getEssay(id);
  if (!data || data.essay.student_id !== user.id) notFound();
  const { essay, reviews } = data;

  return (
    <div className="bg-cream px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1240px]">
        <Link href="/writing/history" className="mb-6 inline-block font-sans text-[13px] font-semibold">
          {h.back}
        </Link>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <section className="rounded-[20px] border border-border-soft bg-white p-6">
              <div className="mb-1.5 font-sans text-[11px] font-bold uppercase tracking-wide text-badge-text">
                {fmt(h.task2, { date: formatDate(essay.created_at, lang) })}
              </div>
              <p lang="en" className="font-display text-[18px] leading-relaxed text-navy">
                {essay.prompt_text}
              </p>
            </section>
            <section className="rounded-[20px] border border-border-soft bg-white p-6">
              <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{h.yourEssay}</h2>
              <EssayText body={essay.body} flags={essay.grammar_flags} />
            </section>
            <form action={deleteEssay} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="essay_id" value={essay.id} />
              <input type="hidden" name="lang" value={lang} />
              <SubmitButton variant="outline-navy" pendingLabel={h.deleting} className="!px-4 !py-2.5 !text-[12.5px]">
                {h.delete}
              </SubmitButton>
              <span className="font-sans text-[12px] text-meta">{h.deleteHint}</span>
            </form>
          </div>

          <div className="lg:sticky lg:top-28">
            <ResultsPanel essay={essay} reviews={reviews} showTeacherButton />
          </div>
        </div>
      </div>
    </div>
  );
}
