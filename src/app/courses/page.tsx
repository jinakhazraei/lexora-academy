import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Badge, Eyebrow } from "@/components/ui";
import { CourseDetailCard } from "@/components/CourseDetailCard";
import { coursesFull, generalLevels } from "@/lib/data";

export const metadata: Metadata = {
  title: "Courses — Lexora Academy",
  description: "Programs for every goal: General English, IELTS, TOEFL, Business English and Private Lessons.",
};

export default function CoursesPage() {
  return (
    <div className="bg-cream px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3.5">Courses</Eyebrow>
          <h1 className="mb-3.5 font-display text-[34px] font-semibold text-navy md:text-[44px]">
            Programs for every goal
          </h1>
          <p className="mx-auto max-w-[560px] text-[16px] leading-relaxed text-muted">
            Contact us for a personalized recommendation and full schedule — every plan is built around your
            level and timeline.
          </p>
        </div>

        {/* General English levels */}
        <div id="general" className="mb-9 scroll-mt-24 rounded-[20px] border border-border-soft bg-white p-9">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-5">
            <div>
              <Badge>General English</Badge>
              <div className="mt-3 font-display text-2xl font-semibold text-navy">
                A1 to C2 — a complete pathway
              </div>
            </div>
            <Button variant="navy" href="/contact?course=general" className="whitespace-nowrap">
              Contact Us
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3.5 md:grid-cols-6">
            {generalLevels.map((lvl) => (
              <div key={lvl.level} className="rounded-xl border border-border-soft p-4 text-center">
                <div className="font-display text-xl font-bold text-navy">{lvl.level}</div>
                <div className="mt-1 font-sans text-xs text-muted">{lvl.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {coursesFull.map((course) => (
            <CourseDetailCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
