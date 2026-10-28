import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { Eyebrow } from "@/components/ui";
import { fmt } from "@/i18n/config";
import { languageAlternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { extras, formatAmd } from "@/lib/pricing";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.meta.pricing, description: t.meta.pricingDescription, alternates: languageAlternates(lang, "/pricing") };
}

export default async function PricingPage() {
  const { lang, t } = await getI18n();
  const p = t.pricing;
  const amd = (n: number) => formatAmd(n, lang, t.common.amd);

  const extraRows = [
    { item: p.extras.placement.item, price: p.extras.placement.price, note: p.extras.placement.note },
    { item: p.extras.mock.item, price: amd(extras.mockExam), note: p.extras.mock.note },
    { item: p.extras.speakingMock.item, price: amd(extras.speakingMock), note: p.extras.speakingMock.note },
    { item: p.extras.writingTask.item, price: fmt(p.extras.writingTask.price, { price: amd(extras.writingTask) }), note: p.extras.writingTask.note },
    {
      item: p.extras.corporate.item,
      price: fmt(p.extras.corporate.price, { online: amd(extras.corporateOnline), onsite: amd(extras.corporateOnsite) }),
      note: p.extras.corporate.note,
    },
  ];

  const discounts = [p.discounts.opening, p.discounts.upfront, p.discounts.friend, p.discounts.family];

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-16 sm:px-6 md:px-12 md:pt-20">
        <div className="mb-10 text-center md:mb-12">
          <Eyebrow className="mb-3.5">{p.eyebrow}</Eyebrow>
          <h1 className="mb-3.5 font-display text-[34px] font-semibold text-navy md:text-[46px]">{p.title}</h1>
          <p className="mx-auto max-w-[620px] font-sans text-[16px] leading-relaxed text-muted">{p.intro}</p>
        </div>

        <PricingPlans />

        {/* Extras */}
        <section className="mt-16">
          <h2 className="mb-2 font-display text-[26px] font-semibold text-navy md:text-[30px]">{p.extrasTitle}</h2>
          <p className="mb-6 font-sans text-[14.5px] text-muted">{p.extrasIntro}</p>
          <div className="overflow-hidden rounded-[20px] border border-border-soft bg-white">
            <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)] gap-4 border-b border-border-soft px-6 py-3 font-sans text-[11.5px] font-bold uppercase tracking-wide text-meta md:grid">
              <div>{p.extrasHead.item}</div>
              <div>{p.extrasHead.price}</div>
              <div>{p.extrasHead.note}</div>
            </div>
            <ul className="divide-y divide-cream-alt">
              {extraRows.map((row) => (
                <li
                  key={row.item}
                  className="grid grid-cols-1 gap-1 px-6 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)] md:gap-4"
                >
                  <div className="font-sans text-[14.5px] font-semibold text-navy">{row.item}</div>
                  <div className="font-sans text-[14.5px] font-bold tabular-nums text-ink">{row.price}</div>
                  <div className="font-sans text-[13px] text-muted">{row.note}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Discounts */}
        <section className="mt-16">
          <h2 className="mb-2 font-display text-[26px] font-semibold text-navy md:text-[30px]">{p.discountsTitle}</h2>
          <p className="mb-6 font-sans text-[14.5px] text-muted">{p.discountsNote}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {discounts.map((d) => (
              <div key={d.title} className="rounded-[20px] border border-border-soft bg-white p-6">
                <div className="mb-2 font-sans text-[15px] font-bold text-navy">{d.title}</div>
                <div className="font-sans text-[14px] leading-relaxed text-ink">{d.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Policies */}
        <section className="mt-16">
          <h2 className="mb-6 font-display text-[26px] font-semibold text-navy md:text-[30px]">{p.policiesTitle}</h2>
          <ul className="grid grid-cols-1 gap-x-10 gap-y-3 rounded-[20px] border border-border-soft bg-white p-6 md:grid-cols-2 md:p-8">
            {p.policies.map((policy) => (
              <li key={policy} className="flex gap-2.5 font-sans text-[14px] leading-relaxed text-ink">
                <span className="text-gold">—</span>
                {policy}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="bg-navy px-6 py-20 text-center md:px-12">
        <div className="mb-4 font-display text-[28px] font-semibold text-white md:text-4xl">{p.ctaTitle}</div>
        <p className="mx-auto mb-8 max-w-[560px] text-white/60">{p.ctaText}</p>
        <Button href="/contact" size="lg">
          {t.common.bookConsultation}
        </Button>
      </div>
    </div>
  );
}
