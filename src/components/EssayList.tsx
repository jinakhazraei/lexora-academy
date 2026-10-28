"use client";

import Link from "@/components/LocaleLink";
import { BandPill } from "@/components/scores";
import { formatDate, plural } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import type { EssaySummary } from "@/lib/queries";

const STATUS_CLASSES: Record<Exclude<EssaySummary["review_status"], "none">, string> = {
  requested: "bg-badge-bg text-badge-text",
  reviewed: "bg-[#f1f8ee] text-[#2f6b2a]",
};

export function EssayList({
  essays,
  hrefBase = "/writing/history",
  emptyText,
}: {
  essays: EssaySummary[];
  /** Each essay links to `${hrefBase}/${id}`. */
  hrefBase?: string;
  emptyText?: string;
}) {
  const { lang, t } = useI18n();
  if (essays.length === 0) {
    return <p className="font-sans text-sm text-muted">{emptyText ?? t.dashboard.noEssays}</p>;
  }
  return (
    <ul className="flex flex-col divide-y divide-cream-alt">
      {essays.map((e) => {
        const status = e.review_status === "none" ? null : e.review_status;
        return (
          <li key={e.id}>
            <Link href={`${hrefBase}/${e.id}`} className="group flex items-center gap-4 py-3.5 text-ink hover:text-ink">
              <BandPill band={e.overall_band} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-sans text-[14px] font-semibold text-navy group-hover:text-gold">{e.prompt_text}</div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[12px] text-meta">
                  <span>{formatDate(e.created_at, lang)}</span>
                  <span>{plural(e.word_count, lang, t.common.wordForms)}</span>
                  {status && (
                    <span className={`rounded-full px-2 py-0.5 font-bold ${STATUS_CLASSES[status]}`}>{t.results.status[status]}</span>
                  )}
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
