import Link from "next/link";
import { BandPill } from "@/components/scores";
import { formatDate } from "@/components/writing/ResultsPanel";
import type { EssaySummary } from "@/lib/queries";

const STATUS: Record<EssaySummary["review_status"], { label: string; cls: string } | null> = {
  none: null,
  requested: { label: "With teacher", cls: "bg-badge-bg text-badge-text" },
  reviewed: { label: "Teacher reviewed", cls: "bg-[#f1f8ee] text-[#2f6b2a]" },
};

export function EssayList({
  essays,
  hrefFor = (e) => `/writing/history/${e.id}`,
  emptyText = "No essays yet.",
}: {
  essays: EssaySummary[];
  hrefFor?: (e: EssaySummary) => string;
  emptyText?: string;
}) {
  if (essays.length === 0) {
    return <p className="font-sans text-sm text-muted">{emptyText}</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-cream-alt">
      {essays.map((e) => {
        const status = STATUS[e.review_status];
        return (
          <li key={e.id}>
            <Link href={hrefFor(e)} className="group flex items-center gap-4 py-3.5 text-ink hover:text-ink">
              <BandPill band={e.overall_band} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-[14px] font-semibold text-navy group-hover:text-gold">{e.prompt_text}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12px] text-meta">
                  <span>{formatDate(e.created_at)}</span>
                  <span>{e.word_count} words</span>
                  {status && <span className={`rounded-full px-2 py-0.5 font-bold ${status.cls}`}>{status.label}</span>}
                </div>
              </div>
              <span aria-hidden="true" className="font-sans text-meta group-hover:text-gold">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
