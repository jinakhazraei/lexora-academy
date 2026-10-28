"use client";

import { fmt, formatDate } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { formatBand } from "@/lib/ielts";
import type { ScoreSource } from "@/lib/types";

/** The line that sits next to every score on the site. */
export function BandDisclaimer({ className = "", tone = "muted" }: { className?: string; tone?: "muted" | "light" }) {
  const { t } = useI18n();
  return (
    <p
      className={`flex items-center gap-1.5 font-sans text-[11.5px] leading-snug ${
        tone === "light" ? "text-white/60" : "text-meta"
      } ${className}`}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" className="shrink-0">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <line x1="8" y1="7" x2="8" y2="11.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="4.9" r="0.95" fill="currentColor" />
      </svg>
      {t.common.disclaimer}
    </p>
  );
}

/** Horizontal 0–9 meter with an optional gold target marker. */
export function BandMeter({
  value,
  target,
  label,
  height = 10,
}: {
  value: number | null;
  target?: number | null;
  label: string;
  height?: number;
}) {
  const { t } = useI18n();
  const pct = value === null ? 0 : (value / 9) * 100;
  const targetPct = target ? (target / 9) * 100 : null;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={9}
      aria-valuenow={value ?? undefined}
      aria-valuetext={
        value === null
          ? t.scores.noScore
          : target
            ? fmt(t.scores.bandOfTarget, { band: formatBand(value), target: formatBand(target) })
            : fmt(t.scores.band, { band: formatBand(value) })
      }
      className="relative w-full rounded-full bg-cream-alt"
      style={{ height }}
    >
      {value !== null && (
        <div className="absolute inset-y-0 left-0 rounded-full bg-navy transition-[width] duration-700" style={{ width: `${pct}%` }} />
      )}
      {targetPct !== null && (
        <div
          className="absolute -top-[4px] -bottom-[4px] w-[3px] -translate-x-1/2 rounded-full bg-gold ring-2 ring-white"
          style={{ left: `${targetPct}%` }}
          title={fmt(t.scores.target, { band: formatBand(target) })}
        />
      )}
    </div>
  );
}

/** One of the four writing criteria: label, band and bar, with an optional note. */
export function CriterionBar({ label, short, band, note }: { label: string; short: string; band: number; note?: string }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <div className="font-sans text-[13.5px] font-semibold text-navy">
          {label} <span className="font-normal text-meta">· {short}</span>
        </div>
        <div className="font-display text-lg font-semibold tabular-nums text-navy">{formatBand(band)}</div>
      </div>
      <BandMeter value={Number(band)} label={fmt(t.results.bandOf, { label })} height={8} />
      {note && <p className="mt-2 font-sans text-[13px] leading-relaxed text-muted">{note}</p>}
    </div>
  );
}

/** Small "6.5" pill for lists. */
export function BandPill({ band, className = "" }: { band: number | null; className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex min-w-[46px] items-center justify-center rounded-full bg-navy px-2.5 py-1 font-sans text-[13px] font-bold tabular-nums text-gold-light ${className}`}
      title={t.common.disclaimer}
    >
      {formatBand(band)}
    </span>
  );
}

/** Tiny single-series trend line for a skill card. Points carry native tooltips. */
export function Sparkline({
  points,
  label,
  width = 220,
  height = 44,
}: {
  points: { band: number; date: string; source: ScoreSource }[];
  label: string;
  width?: number;
  height?: number;
}) {
  const { lang, t } = useI18n();
  if (points.length < 2) return null;
  const pad = 5;
  const bands = points.map((p) => p.band);
  const min = Math.max(0, Math.min(...bands) - 0.5);
  const max = Math.min(9, Math.max(...bands) + 0.5);
  const span = Math.max(max - min, 1);
  const x = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (b: number) => pad + (1 - (b - min) / span) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.band).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block h-auto w-full overflow-visible"
      role="img"
      aria-label={`${label}: ${points.map((p) => formatBand(p.band)).join(", ")}`}
    >
      <path d={d} fill="none" stroke="var(--color-navy)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={`${p.date}-${i}`}>
          <circle cx={x(i)} cy={y(p.band)} r="9" fill="transparent">
            <title>
              {fmt(t.scores.point, {
                date: formatDate(p.date, lang, { year: false }),
                band: formatBand(p.band),
                source: t.sources[p.source],
              })}
            </title>
          </circle>
          {i === points.length - 1 && (
            <circle cx={x(i)} cy={y(last.band)} r="4" fill="var(--color-gold)" stroke="white" strokeWidth="2" />
          )}
        </g>
      ))}
    </svg>
  );
}
