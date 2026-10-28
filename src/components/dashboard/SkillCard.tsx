"use client";

import Link from "@/components/LocaleLink";
import { BandMeter, Sparkline } from "@/components/scores";
import { fmt, formatDate } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { formatBand } from "@/lib/ielts";
import type { SkillProgress } from "@/lib/progress";

const SKILL_ICONS: Record<SkillProgress["skill"], React.ReactNode> = {
  listening: <path d="M5 13v-1a7 7 0 0 1 14 0v1M5 13h2.5v6H6a1 1 0 0 1-1-1v-5zm14 0h-2.5v6H18a1 1 0 0 0 1-1v-5z" />,
  reading: <path d="M3 5.5C5 4.5 8 4.5 12 6c4-1.5 7-1.5 9-.5V19c-2-1-5-1-9 .5-4-1.5-7-1.5-9-.5zM12 6v13.5" />,
  writing: <path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" />,
  speaking: <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4" />,
};

export function SkillCard({
  progress,
  target,
  showActions = true,
}: {
  progress: SkillProgress;
  target: number | null;
  /** The "write your first essay / log a test" links — only for the student themselves. */
  showActions?: boolean;
}) {
  const { lang, t } = useI18n();
  const d = t.dashboard;
  const { latest, change, count, points, skill } = progress;
  const label = t.skills[skill];
  const latestBand = latest ? Number(latest.band) : null;
  const gap = latestBand !== null && target ? Number(target) - latestBand : null;

  return (
    <div className="flex flex-col rounded-[20px] border border-border-soft bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-badge-bg">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#8a6a10" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {SKILL_ICONS[skill]}
            </svg>
          </span>
          <span className="font-sans text-[15px] font-bold text-navy">{label}</span>
        </div>
        {change !== null && change !== 0 && (
          <span
            className={`rounded-full px-2 py-0.5 font-sans text-[11.5px] font-bold tabular-nums ${
              change > 0 ? "bg-[#f1f8ee] text-[#2f6b2a]" : "bg-[#fbeeee] text-[#9a3434]"
            }`}
            title={d.changeSinceFirst}
          >
            {change > 0 ? "▲ +" : "▼ "}
            {Math.abs(change).toFixed(1)}
          </span>
        )}
      </div>

      {latest && latestBand !== null ? (
        <>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="font-display text-[40px] font-semibold leading-none tabular-nums text-navy">{formatBand(latestBand)}</span>
            {target && <span className="font-sans text-[13px] text-meta">{fmt(t.scores.ofTarget, { band: formatBand(target) })}</span>}
          </div>
          <div className="mb-4 font-sans text-[12px] text-meta">
            {t.sources[latest.source]} · {formatDate(latest.taken_on, lang, { year: false })}
          </div>
          <BandMeter value={latestBand} target={target} label={fmt(d.progress, { skill: label })} />
          <div className="mt-2 font-sans text-[12px] text-muted">
            {gap === null
              ? count === 1
                ? d.scoreLogged
                : fmt(d.scoresLogged, { count })
              : gap > 0
                ? fmt(d.toTarget, { gap: gap.toFixed(1) })
                : d.targetReached}
          </div>
          {points.length >= 2 && (
            <div className="mt-4 border-t border-cream-alt pt-3">
              <Sparkline points={points} label={fmt(d.trend, { skill: label })} />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-1 font-display text-[40px] font-semibold leading-none text-border-soft">—</div>
          <div className="mb-4 font-sans text-[12px] text-meta">{d.noScores}</div>
          <BandMeter value={null} target={target} label={fmt(d.progress, { skill: label })} />
          {showActions && (
            <div className="mt-3 font-sans text-[12.5px]">
              {skill === "writing" ? (
                <Link href="/writing" className="font-semibold">
                  {d.firstEssay}
                </Link>
              ) : (
                <a href="#log-score" className="font-semibold">
                  {d.logPractice}
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
