import Link from "next/link";
import { deletePracticeScore } from "@/app/dashboard/actions";
import { BandDisclaimer } from "@/components/scores";
import { SKILLS, SOURCE_LABELS, formatBand } from "@/lib/ielts";
import type { SkillScoreRow } from "@/lib/types";

const skillLabel = (key: SkillScoreRow["skill"]) => SKILLS.find((s) => s.key === key)?.label ?? key;

/** Every score as a table — the accessible view of the progress cards. */
export function ScoreHistory({
  scores,
  canDelete = true,
  essayHref = (id: string) => `/writing/history/${id}`,
}: {
  scores: SkillScoreRow[];
  canDelete?: boolean;
  essayHref?: (id: string) => string;
}) {
  const rows = [...scores].reverse();
  if (rows.length === 0) return <p className="font-sans text-sm text-muted">No scores yet.</p>;

  return (
    <div>
      <div className="-mx-2 overflow-x-auto px-2">
        <table className="w-full min-w-[560px] border-collapse text-left font-sans text-[13.5px]">
          <thead>
            <tr className="border-b border-border-soft text-[11.5px] font-bold uppercase tracking-wide text-meta">
              <th scope="col" className="py-2.5 pr-3 font-bold">Date</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">Skill</th>
              <th scope="col" className="py-2.5 pr-3 text-right font-bold">Band</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">Source</th>
              <th scope="col" className="py-2.5 pr-3 font-bold">Details</th>
              {canDelete && <th scope="col" className="py-2.5"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-cream-alt last:border-b-0">
                <td className="whitespace-nowrap py-2.5 pr-3 text-muted">
                  {new Date(s.taken_on).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="py-2.5 pr-3 font-semibold text-navy">{skillLabel(s.skill)}</td>
                <td className="py-2.5 pr-3 text-right font-bold tabular-nums text-navy">{formatBand(s.band)}</td>
                <td className="py-2.5 pr-3 text-muted">{SOURCE_LABELS[s.source]}</td>
                <td className="py-2.5 pr-3 text-muted">
                  {s.essay_id ? <Link href={essayHref(s.essay_id)}>{s.label ?? "Essay"}</Link> : (s.label ?? "—")}
                </td>
                {canDelete && (
                  <td className="py-2.5 text-right">
                    {s.source === "self" && (
                      <form action={deletePracticeScore}>
                        <input type="hidden" name="score_id" value={s.id} />
                        <button type="submit" className="cursor-pointer font-sans text-[12px] font-semibold text-meta hover:text-red-700" aria-label={`Delete ${skillLabel(s.skill)} score from ${s.taken_on}`}>
                          Remove
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BandDisclaimer className="mt-4" />
    </div>
  );
}
