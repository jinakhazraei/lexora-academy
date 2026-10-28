import Image from "next/image";
import { Button } from "@/components/Button";
import { Eyebrow } from "@/components/ui";
import { HeroVideo } from "@/components/HeroVideo";
import { StatsBar } from "@/components/StatsBar";
import { WhyLexoraGrid } from "@/components/WhyLexoraGrid";
import { CourseCard } from "@/components/CourseCard";
import { AiFeaturesSection } from "@/components/AiFeaturesSection";
import { TestimonialSection } from "@/components/TestimonialSection";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getI18n } from "@/i18n/server";
import { courseIds, getCourse } from "@/lib/data";

export default async function Home() {
  const { lang, t } = await getI18n();

  return (
    <div className="bg-cream">
      {/* Hero */}
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-10 px-6 py-20 text-center md:gap-12 md:px-12 md:py-24">
        <div>
          <div className="mb-[18px] font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-gold">{t.home.eyebrow}</div>
          <h1 className="mb-[22px] font-display text-[36px] font-semibold leading-[1.12] text-navy md:text-[56px]">
            {t.home.titleLines.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p className="mx-auto mb-8 max-w-[520px] text-[17px] leading-relaxed text-muted md:text-[18px]">{t.home.intro}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/contact" size="lg">
              {t.common.bookConsultation}
            </Button>
            <Button href="/courses" variant="outline-navy" size="lg">
              {t.common.exploreCourses}
            </Button>
          </div>
        </div>
        <HeroVideo />
      </div>

      {/* Stats */}
      <div className="px-6 md:px-12">
        <StatsBar t={t} />
      </div>

      {/* Why Lexora */}
      <div id="why-lexora" className="mx-auto max-w-[1320px] scroll-mt-20 px-6 py-24 md:px-12 md:py-28">
        <div className="mb-14 grid grid-cols-1 items-center gap-10 md:mb-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-12">
          <div>
            <Eyebrow className="mb-3.5">{t.home.whyEyebrow}</Eyebrow>
            <h2 className="font-display text-[30px] font-semibold text-navy md:text-[38px]">{t.home.whyTitle}</h2>
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src="/images/teacher-kids-microscope.jpg"
              alt={t.home.whyImageAlt}
              width={640}
              height={400}
              className="block h-full w-full object-cover"
            />
          </div>
        </div>
        <WhyLexoraGrid t={t} />
      </div>

      {/* Courses preview */}
      <div className="mx-auto max-w-[1320px] px-6 pb-24 md:px-12 md:pb-28">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3.5">{t.home.programsEyebrow}</Eyebrow>
          <h2 className="font-display text-[30px] font-semibold text-navy md:text-[38px]">{t.home.programsTitle}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courseIds.map((id) => (
            <CourseCard key={id} course={getCourse(t, id)} lang={lang} t={t} />
          ))}
        </div>
      </div>

      <AiFeaturesSection t={t} />
      <TestimonialSection />
      <FaqAccordion />

      {/* Final CTA */}
      <div className="bg-navy px-6 py-24 text-center md:px-12">
        <div className="mb-4 font-display text-[28px] font-semibold text-white md:text-4xl">{t.home.ctaTitle}</div>
        <p className="mb-8 text-white/60">{t.home.ctaText}</p>
        <Button href="/contact" size="lg">
          {t.common.bookConsultation}
        </Button>
      </div>
    </div>
  );
}
