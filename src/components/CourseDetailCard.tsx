import Image from "next/image";
import { Badge } from "@/components/ui";
import { Button } from "@/components/Button";
import { CoursePrice } from "@/components/CourseCard";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Course } from "@/lib/data";

export function CourseDetailCard({ course, lang, t }: { course: Course; lang: Locale; t: Dictionary }) {
  return (
    <div id={course.id} className="scroll-mt-24 overflow-hidden rounded-[20px] border border-border-soft bg-white">
      <div className="relative h-[130px] w-full overflow-hidden">
        <Image src={course.image} alt={course.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="p-8">
        <Badge>{course.tag}</Badge>
        <div className="my-3.5 font-display text-2xl font-semibold text-navy">{course.name}</div>
        <div className="mb-[18px] font-sans text-[14.5px] leading-relaxed text-muted">{course.overview}</div>
        <div className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-navy">{t.common.objectives}</div>
        <div className="mb-[18px] flex flex-col gap-1.5">
          {course.objectives.map((o) => (
            <div key={o} className="flex gap-2 font-sans text-[13.5px] text-muted">
              <span className="text-gold">—</span>
              {o}
            </div>
          ))}
        </div>
        <div className="mb-5 flex flex-wrap gap-x-6 gap-y-1 border-t border-cream-alt pt-3.5 font-sans text-[12.5px] text-meta">
          <span>
            {t.common.duration}: {course.duration}
          </span>
          <span>
            {t.common.schedule}: {course.schedule}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CoursePrice course={course} lang={lang} t={t} />
          <div className="flex gap-2">
            <Button variant="outline-navy" href="/pricing">
              {t.common.seePrices}
            </Button>
            <Button variant="navy" href={`/contact?course=${course.id}`}>
              {t.common.contactUs}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
