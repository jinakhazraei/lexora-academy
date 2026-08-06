import Image from "next/image";
import { Badge } from "@/components/ui";
import { Button } from "@/components/Button";
import type { Course } from "@/lib/data";

export function CourseCard({ course }: { course: Course }) {
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
        <div className="mb-1.5 font-sans text-xs font-semibold text-navy">Who it&apos;s for</div>
        <div className="mb-3.5 font-sans text-[13px] text-muted">{course.whoFor}</div>
        <div className="mb-5 flex flex-wrap gap-4 font-sans text-[12.5px] text-meta">
          <span>Duration: {course.duration}</span>
          <span>Schedule: {course.schedule}</span>
        </div>
        <Button variant="navy" href={`/contact?course=${course.id}`} className="mt-auto">
          Contact Us
        </Button>
      </div>
    </div>
  );
}
