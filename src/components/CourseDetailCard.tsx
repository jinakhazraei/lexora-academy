import Image from "next/image";
import { Badge } from "@/components/ui";
import { Button } from "@/components/Button";
import type { Course } from "@/lib/data";

export function CourseDetailCard({ course }: { course: Course }) {
  return (
    <div id={course.id} className="scroll-mt-24 overflow-hidden rounded-[20px] border border-border-soft bg-white">
      <div className="relative h-[130px] w-full overflow-hidden">
        <Image
          src={course.image}
          alt={course.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="p-8">
        <Badge>{course.tag}</Badge>
        <div className="my-3.5 font-display text-2xl font-semibold text-navy">{course.name}</div>
        <div className="mb-[18px] font-sans text-[14.5px] leading-relaxed text-muted">{course.overview}</div>
        <div className="mb-2 font-sans text-xs font-bold uppercase tracking-wide text-navy">Objectives</div>
        <div className="mb-[18px] flex flex-col gap-1.5">
          {course.objectives.map((o) => (
            <div key={o} className="flex gap-2 font-sans text-[13.5px] text-muted">
              <span className="text-gold">—</span>
              {o}
            </div>
          ))}
        </div>
        <div className="mb-5 flex gap-6 border-t border-cream-alt pt-3.5 font-sans text-[12.5px] text-meta">
          <span>Duration: {course.duration}</span>
          <span>Schedule: {course.schedule}</span>
        </div>
        <Button variant="navy" href={`/contact?course=${course.id}`}>
          Contact Us
        </Button>
      </div>
    </div>
  );
}
