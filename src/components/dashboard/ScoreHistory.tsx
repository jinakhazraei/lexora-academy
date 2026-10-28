"use client";

import Link from "@/components/LocaleLink";
import { BandDisclaimer } from "@/components/scores";
import { fmt, formatDate } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { deletePracticeScore } from "@/lib/actions/dashboard";
import { formatBand } from "@/lib/ielts";
import type { SkillScoreRow } from "@/lib/types";

/** Every score as a table — the accessible view of the progress cards. */
export function ScoreHistory({
  scores,
  canDelete = true,
  essayHrefBase = "/writing/history",
}: {
  scores: SkillScoreRow[];
  canDelete?: boolean;
  /** Essay links go to `${essayHrefBase}/${essayId}`. */
  essayHrefBase?: string;
}) {
  const { lang, t } = useI18n();
  const d = t.dashboard;
  const rows = [...scores].reverse();
  if (rows.length === 0) return <p className="font-sans text-sm text-muted">{d.noScores}</p>;

  return (
    <div>
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[560px] border-collapse text-left font-sans text-[13.5px]">
          <thead>
            <tr className="border-b border-border-soft text-[11.5px] font-bold uppercase tracking-wide text-meta">
              <th scope="col" className="py-2.5 pr-3 font-bold">{d.table.date}</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">{d.table.skill}</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-bold">{d.table.band}</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">{d.table.source}</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">{d.table.details}</th>
              {canDelete && <th scope="col" className="py-2.5"><span className="sr-only">{d.table.actions}</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const date = formatDate(s.taken_on, lang);
              return (
                <tr key={s.id} className="border-b border-cream-alt last:border-b-0">
                  <td className="whitespace-nowrap py-2.5 pr-3 text-muted">{date}</td>
                  <td className="py-2.5 pr-3 font-semibold text-navy">{t.skills[s.skill]}</td>
                  <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-navy">{formatBand(s.band)}</td>
                  <td className="py-2.5 pr-3 text-muted">{t.sources[s.source]}</td>
                  <td className="py-2.5 pr-3 text-muted">
                    {s.essay_id ? (
                      <Link href={`${essayHrefBase}/${s.essay_id}`}>{s.source === "ai" ? d.essayLabel : (s.label ?? d.essayLabel)}</Link>
                    ) : (
                      (s.label ?? "—")
                    )}
                  </td>
                  {canDelete && (
                    <td className="py-2.5 text-right">
                      {s.source === "self" && (
                        <form action={deletePracticeScore}>
                          <input type="hidden" name="score_id" value={s.id} />
                          <button
                            type="submit"
                            className="cursor-pointer font-sans text-[12px] font-semibold text-meta hover:text-red-700"
                            aria-label={fmt(t.scores.deleteScore, { skill: t.skills[s.skill], date })}
                          >
                            {t.common.remove}
                          </button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <BandDisclaimer className="mt-4" />
    </div>
  );
}
