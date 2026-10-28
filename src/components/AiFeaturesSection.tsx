import Image from "next/image";
import Link from "@/components/LocaleLink";
import type { Dictionary } from "@/i18n/dictionaries";
import { aiFeatureList } from "@/lib/data";

export function AiFeaturesSection({ t }: { t: Dictionary }) {
  return (
    <div className="relative overflow-hidden bg-[linear-gradient(160deg,#0A1428,#1B2C52_65%,#0F1B33)] px-6 py-24 md:px-12 md:py-28">
      <Image src="/images/nyc-skyline.jpg" alt="" fill sizes="100vw" className="object-cover opacity-[0.15]" />
      <div className="relative mx-auto max-w-[1320px]">
        <div className="mb-14 text-center">
          <div className="mb-3.5 font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-gold-light">{t.home.aiEyebrow}</div>
          <h2 className="mb-3.5 font-display text-[32px] font-semibold text-white md:text-[38px]">{t.home.aiTitle}</h2>
          <p className="mx-auto max-w-[540px] text-[16px] leading-relaxed text-white/60">{t.home.aiIntro}</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {aiFeatureList.map((f) => {
            const text = t.content.aiFeatures[f.key];
            const body = (
              <>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="font-sans text-[15px] font-bold text-gold-light">{text.title}</div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 font-sans text-[10.5px] font-bold uppercase tracking-wide ${
                      f.status === "live" ? "bg-gold text-navy" : "bg-white/10 text-white/60"
                    }`}
                  >
                    {f.status === "live" ? t.home.aiLive : t.home.aiSoon}
                  </span>
                </div>
                <div className="font-sans text-[13px] leading-relaxed text-white/65">{text.desc}</div>
              </>
            );
            return f.href ? (
              <Link
                key={f.key}
                href={f.href}
                className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md transition-colors hover:border-gold-light/50 hover:bg-white/[0.1]"
              >
                {body}
              </Link>
            ) : (
              <div key={f.key} className="rounded-2xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur-md">
                {body}
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link href="/how-our-ai-works" className="font-sans text-[14px] font-semibold text-gold-light hover:text-white">
            {t.home.aiLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
