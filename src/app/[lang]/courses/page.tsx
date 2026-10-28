import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CoursePrice } from "@/components/CourseCard";
import { CourseDetailCard } from "@/components/CourseDetailCard";
import { Badge, Eyebrow } from "@/components/ui";
import { languageAlternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { detailCourseIds, getCourse, levelCodes } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.meta.courses, description: t.meta.coursesDescription, alternates: languageAlternates(lang, "/courses") };
}

export default async function CoursesPage() {
  const { lang, t } = await getI18n();
  const general = getCourse(t, "general");

  return (
    <div className="bg-cream px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3.5">{t.coursesPage.eyebrow}</Eyebrow>
          <h1 className="mb-3.5 font-display text-[34px] font-semibold text-navy md:text-[44px]">{t.coursesPage.title}</h1>
          <p className="mx-auto max-w-[580px] text-[16px] leading-relaxed text-muted">{t.coursesPage.intro}</p>
        </div>

        {/* General English levels */}
        <div id="general" className="mb-9 scroll-mt-24 rounded-[20px] border border-border-soft bg-white p-6 sm:p-9">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
            <div>
              <Badge>{general.tag}</Badge>
              <div className="mt-3 font-display text-2xl font-semibold text-navy">{t.coursesPage.generalTitle}</div>
              <div className="mt-2">
                <CoursePrice course={general} lang={lang} t={t} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline-navy" href="/pricing" className="whitespace-nowrap">
                {t.common.seePrices}
              </Button>
              <Button variant="navy" href="/contact?course=general" className="whitespace-nowrap">
                {t.common.contactUs}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3.5 md:grid-cols-6">
            {levelCodes.map((level) => (
              <div key={level} className="rounded-xl border border-border-soft p-4 text-center">
                <div className="font-display text-xl font-bold text-navy">{level}</div>
                <div className="mt-1 font-sans text-xs text-muted">{t.content.levels[level]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {detailCourseIds.map((id) => (
            <CourseDetailCard key={id} course={getCourse(t, id)} lang={lang} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
