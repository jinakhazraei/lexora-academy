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
import { courses } from "@/lib/data";

export default function Home() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-10 px-6 py-20 text-center md:gap-12 md:px-12 md:py-24">
        <div>
          <div className="mb-[18px] font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-gold">
            Yerevan · English Language Academy
          </div>
          <h1 className="mb-[22px] font-display text-[38px] font-semibold leading-[1.1] text-navy md:text-[58px]">
            Learn English faster.
            <br />
            Study smarter.
            <br />
            Build your future.
          </h1>
          <p className="mx-auto mb-8 max-w-[480px] text-[17px] leading-relaxed text-muted md:text-[18px]">
            Small classes, AI-assisted feedback and instructors who care about your progress — from your first
            words to your IELTS band score.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/contact" size="lg">
              Book a Free Consultation
            </Button>
            <Button href="/courses" variant="outline-navy" size="lg">
              Explore Courses
            </Button>
          </div>
        </div>
        <HeroVideo />
      </div>

      {/* Stats */}
      <div className="px-6 md:px-12">
        <StatsBar />
      </div>

      {/* Why Lexora */}
      <div id="why-lexora" className="mx-auto max-w-[1320px] scroll-mt-20 px-6 py-24 md:px-12 md:py-28">
        <div className="mb-14 grid grid-cols-1 items-center gap-10 md:mb-16 md:grid-cols-[1.1fr_0.9fr] md:gap-12">
          <div>
            <Eyebrow className="mb-3.5">Why Lexora Academy</Eyebrow>
            <h2 className="font-display text-[30px] font-semibold text-navy md:text-[38px]">
              A different kind of language school
            </h2>
          </div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl">
            <Image
              src="/images/teacher-kids-microscope.jpg"
              alt="Lexora Academy instructor with students"
              width={640}
              height={400}
              className="block h-full w-full object-cover"
            />
          </div>
        </div>
        <WhyLexoraGrid />
      </div>

      {/* Courses preview */}
      <div className="mx-auto max-w-[1320px] px-6 pb-24 md:px-12 md:pb-28">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3.5">Programs</Eyebrow>
          <h2 className="font-display text-[30px] font-semibold text-navy md:text-[38px]">
            Find the right course
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      <AiFeaturesSection />
      <TestimonialSection />
      <FaqAccordion />

      {/* Final CTA */}
      <div className="bg-navy px-6 py-24 text-center md:px-12">
        <div className="mb-4 font-display text-[28px] font-semibold text-white md:text-4xl">
          Ready to start your English journey?
        </div>
        <p className="mb-8 text-white/60">Book a free consultation and we&apos;ll recommend the right course for you.</p>
        <Button href="/contact" size="lg">
          Book a Free Consultation
        </Button>
      </div>
    </div>
  );
}
