"use client";

import { useState } from "react";
import Link from "@/components/LocaleLink";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import {
  formatAmd,
  groupSize,
  homeVisit,
  hourly,
  hoursPerMonth,
  monthly,
  priceFormats,
  priceLines,
  type Mode,
  type PriceFormat,
  type PriceLine,
} from "@/lib/pricing";

const contactCourse: Record<PriceLine, string> = { ielts: "ielts", business: "business", general: "general" };

export function PricingPlans() {
  const { lang, t } = useI18n();
  const p = t.pricing;
  const [mode, setMode] = useState<Mode>("online");
  const [line, setLine] = useState<PriceLine>("ielts");
  const amd = (n: number) => formatAmd(n, lang, t.common.amd);

  const lengthFor = (format: PriceFormat) =>
    format === "individual" ? (mode === "home" ? p.lengths.individualHome : p.lengths.individualOnline) : p.lengths[format];

  return (
    <div>
      {/* Controls */}
      <div className="mb-8 flex flex-col gap-5 rounded-[20px] border border-border-soft bg-white p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label={p.courseLabel} className="flex flex-wrap gap-2">
          {priceLines.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={line === l}
              onClick={() => setLine(l)}
              className={`cursor-pointer rounded-full px-4 py-2 font-sans text-[13.5px] font-bold transition-colors ${
                line === l ? "bg-navy text-white" : "bg-cream text-navy hover:bg-cream-alt"
              }`}
            >
              {p.lines[l]}
            </button>
          ))}
        </div>
        <div role="group" aria-label={p.modeLabel} className="grid grid-cols-2 gap-1 rounded-xl bg-cream p-1 lg:w-[420px]">
          {(["online", "home"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`cursor-pointer rounded-lg px-3 py-2 text-left transition-colors ${
                mode === m ? "bg-white shadow-[0_2px_8px_rgba(15,27,51,0.08)]" : "hover:bg-white/60"
              }`}
            >
              <span className="block font-sans text-[13.5px] font-bold text-navy">{m === "online" ? p.online : p.atHome}</span>
              <span className="block font-sans text-[11.5px] leading-snug text-meta">{m === "online" ? p.onlineHint : p.atHomeHint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {priceFormats.map((format) => {
          const best = format === "group";
          const [min, max] = groupSize[line];
          const f = p.formats[format];
          return (
            <div
              key={format}
              className={`relative flex flex-col rounded-[20px] p-6 sm:p-7 ${
                best ? "bg-navy text-white shadow-[0_16px_40px_rgba(15,27,51,0.25)]" : "border border-border-soft bg-white"
              }`}
            >
              {best && (
                <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-navy">
                  {p.popular}
                </span>
              )}
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <div className={`font-display text-[24px] font-semibold ${best ? "text-white" : "text-navy"}`}>{f.name}</div>
                <div className={`font-sans text-[12px] font-bold uppercase tracking-wide ${best ? "text-gold-light" : "text-badge-text"}`}>{f.tag}</div>
              </div>
              <div className={`mb-5 font-sans text-[13px] ${best ? "text-white/65" : "text-muted"}`}>
                {fmt(f.students, { min, max })}
              </div>

              <div className={`font-display text-[40px] font-semibold leading-none tabular-nums ${best ? "text-gold-light" : "text-navy"}`}>
                {amd(monthly(line, format, mode))}
              </div>
              <div className={`mt-1.5 font-sans text-[13px] ${best ? "text-white/65" : "text-meta"}`}>
                {p.perMonth} · {fmt(p.hoursPerMonth, { hours: hoursPerMonth[format] })} · {fmt(p.hourly, { price: amd(hourly[line][format][mode]) })}
              </div>

              <dl className={`mt-6 flex flex-col gap-2.5 border-t pt-5 font-sans text-[13.5px] ${best ? "border-white/15" : "border-cream-alt"}`}>
                <div className="flex justify-between gap-3">
                  <dt className={best ? "text-white/60" : "text-muted"}>{p.lessonLength}</dt>
                  <dd className="text-right font-semibold">{lengthFor(format)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={best ? "text-white/60" : "text-muted"}>{p.lessonSchedule}</dt>
                  <dd className="text-right font-semibold">{p.schedules[format]}</dd>
                </div>
                {format === "group" && (
                  <div className={`font-sans text-[12.5px] ${best ? "text-white/60" : "text-meta"}`}>{fmt(p.groupOpens, { min })}</div>
                )}
              </dl>

              <Link
                href={`/contact?course=${contactCourse[line]}`}
                className={`mt-6 inline-flex items-center justify-center rounded-lg px-5 py-3 font-sans text-[13.5px] font-bold transition-colors ${
                  best ? "bg-gold text-navy hover:text-navy hover:brightness-95" : "border-[1.5px] border-navy text-navy hover:bg-navy hover:text-white"
                }`}
              >
                {p.book}
              </Link>
            </div>
          );
        })}
      </div>

      {mode === "home" && (
        <p className="mt-5 rounded-xl border border-[#ecdcab] bg-[#fffaf0] px-5 py-4 font-sans text-[13.5px] leading-relaxed text-ink">{p.homeNote}</p>
      )}

      <div className="mt-8 rounded-[20px] border border-border-soft bg-white p-6">
        <div className="mb-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{p.examples.title}</div>
        <ul className="flex flex-col gap-2 font-sans text-[14px] leading-relaxed text-ink">
          <li className="flex gap-2">
            <span className="text-gold">—</span>
            {fmt(p.examples.fullLevel, { price: amd(monthly("general", "group", "online") * 3) })}
          </li>
          <li className="flex gap-2">
            <span className="text-gold">—</span>
            {fmt(p.examples.homeVisit, {
              ielts: amd(homeVisit("ielts")),
              business: amd(homeVisit("business")),
              general: amd(homeVisit("general")),
            })}
          </li>
          <li className="flex gap-2">
            <span className="text-gold">—</span>
            {p.examples.privateLessons}
          </li>
        </ul>
      </div>
    </div>
  );
}
