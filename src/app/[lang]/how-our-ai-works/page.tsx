import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/Button";
import Link from "@/components/LocaleLink";
import { BandDisclaimer } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { languageAlternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { aiFeatureList } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t.meta.howAi,
    description: t.meta.howAiDescription,
    alternates: languageAlternates(lang, "/how-our-ai-works"),
  };
}

export default async function HowOurAiWorksPage() {
  const { t } = await getI18n();
  const h = t.howAi;

  return (
    <div className="bg-cream">
      {/* Hero */}
      <div className="mx-auto max-w-[900px] px-6 pb-14 pt-20 text-center md:px-12 md:pt-24">
        <Eyebrow className="mb-4">{h.eyebrow}</Eyebrow>
        <h1 className="mb-5 font-display text-[36px] font-semibold leading-[1.1] text-navy md:text-[52px]">{h.title}</h1>
        <p className="mx-auto max-w-[600px] text-[17px] leading-relaxed text-muted">{h.intro}</p>
      </div>

      {/* Principles */}
      <div className="mx-auto max-w-[1320px] px-6 pb-20 md:px-12">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {h.principles.map((p, i) => (
            <div key={p.title} className="rounded-2xl border border-border-soft bg-white p-7">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-badge-bg font-display text-lg font-bold text-badge-text">
                {i + 1}
              </div>
              <div className="mb-2 font-sans text-base font-bold text-navy">{p.title}</div>
              <div className="font-sans text-sm leading-relaxed text-muted">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <Eyebrow className="mb-3.5">{h.toolsEyebrow}</Eyebrow>
            <h2 className="font-display text-[30px] font-semibold text-navy md:text-[36px]">{h.toolsTitle}</h2>
          </div>
          <div className="flex flex-col divide-y divide-border-soft border-y border-border-soft">
            {aiFeatureList.map((f) => {
              const text = t.content.aiFeatures[f.key];
              return (
                <div key={f.key} className="grid grid-cols-1 gap-3 py-7 md:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
                  <div>
                    <div className="mb-2 font-display text-xl font-semibold text-navy">{text.title}</div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-wide ${
                        f.status === "live" ? "bg-gold text-navy" : "bg-cream-alt text-meta"
                      }`}
                    >
                      {f.status === "live" ? h.liveNow : h.soon}
                    </span>
                    {f.href && f.status === "live" && (
                      <Link href={f.href} className="ml-3 font-sans text-[13px] font-semibold">
                        {t.common.open}
                      </Link>
                    )}
                  </div>
                  <div>
                    <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-wide text-meta">{h.whatItDoes}</div>
                    <p className="font-sans text-[14.5px] leading-relaxed text-ink">{text.what}</p>
                  </div>
                  <div>
                    <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-wide text-meta">{h.teacherFits}</div>
                    <p className="font-sans text-[14.5px] leading-relaxed text-ink">{text.teacher}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Writing scoring, step by step */}
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-12 md:py-24">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="lg:sticky lg:top-28">
            <Eyebrow className="mb-3.5">{h.stepsEyebrow}</Eyebrow>
            <h2 className="mb-5 font-display text-[30px] font-semibold text-navy md:text-[36px]">{h.stepsTitle}</h2>
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl">
              <Image src="/images/hands-typing-notebook.jpg" alt={h.imageAlt} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
            </div>
            <div className="rounded-2xl border border-border-soft bg-white p-6">
              <div className="mb-2 font-sans text-[15px] font-bold text-navy">{h.whichAiTitle}</div>
              <p className="font-sans text-[14px] leading-relaxed text-muted">{h.whichAiText}</p>
              <p className="mt-3 border-t border-cream-alt pt-3 font-sans text-[13.5px] leading-relaxed text-muted">{h.languageNote}</p>
            </div>
          </div>

          <ol className="flex flex-col gap-4">
            {h.steps.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-2xl border border-border-soft bg-white p-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-base font-semibold text-gold-light">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="mb-1.5 font-sans text-base font-bold text-navy">{s.title}</div>
                  <p className="font-sans text-[14.5px] leading-relaxed text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
            <li className="rounded-2xl bg-navy p-6">
              <div className="mb-3 font-sans text-base font-bold text-gold-light">{h.limitsTitle}</div>
              <ul className="flex flex-col gap-2">
                {h.limits.map((l) => (
                  <li key={l} className="flex gap-2.5 font-sans text-[14px] leading-relaxed text-white/75">
                    <span className="text-gold-light">—</span>
                    {l}
                  </li>
                ))}
              </ul>
              <BandDisclaimer tone="light" className="mt-4" />
            </li>
          </ol>
        </div>
      </div>

      {/* Dashboard note */}
      <div className="mx-auto max-w-[900px] px-6 pb-20 md:px-12">
        <div className="rounded-2xl border border-border-soft bg-white p-7">
          <div className="mb-2 font-sans text-base font-bold text-navy">{h.scoresTitle}</div>
          <p className="font-sans text-[14.5px] leading-relaxed text-muted">{h.scoresText}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-navy px-6 py-20 text-center md:px-12">
        <div className="mb-4 font-display text-[28px] font-semibold text-white md:text-4xl">{h.ctaTitle}</div>
        <p className="mb-8 text-white/60">{h.ctaText}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/writing" size="lg">
            {h.ctaButton}
          </Button>
          <Button href="/privacy" variant="outline-navy" size="lg" className="!border-white/40 !text-white hover:!bg-white/10">
            {h.ctaPrivacy}
          </Button>
        </div>
      </div>
    </div>
  );
}
