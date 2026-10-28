import Image from "next/image";
import { Badge } from "@/components/ui";
import { Button } from "@/components/Button";
import { fmt, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Course } from "@/lib/data";
import { formatAmd, startingMonthly } from "@/lib/pricing";

export function CoursePrice({ course, lang, t }: { course: Course; lang: Locale; t: Dictionary }) {
  return (
    <div className="font-sans text-[13px] font-bold text-navy">
      {fmt(t.coursesPage.fromPrice, { price: formatAmd(startingMonthly(course.id), lang, t.common.amd) })}
    </div>
  );
}

export function CourseCard({ course, lang, t }: { course: Course; lang: Locale; t: Dictionary }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border-soft bg-white shadow-[0_8px_24px_rgba(15,27,51,0.05)]">
      <div className="relative h-[150px] w-full overflow-hidden">
        <Image
          src={course.image}
          alt={course.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <Badge className="mb-3.5">{course.tag}</Badge>
        <div className="mb-2.5 font-display text-[22px] font-semibold text-navy">{course.name}</div>
        <div className="mb-3.5 font-sans text-sm leading-relaxed text-muted">{course.overview}</div>
        <div className="mb-1.5 font-sans text-xs font-semibold text-navy">{t.common.whoFor}</div>
        <div className="mb-3.5 font-sans text-[13px] text-muted">{course.whoFor}</div>
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 font-sans text-[12.5px] text-meta">
          <span>
            {t.common.duration}: {course.duration}
          </span>
          <span>
            {t.common.schedule}: {course.schedule}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-cream-alt pt-4">
          <CoursePrice course={course} lang={lang} t={t} />
          <Button variant="navy" href={`/contact?course=${course.id}`}>
            {t.common.contactUs}
          </Button>
        </div>
      </div>
    </div>
  );
}
