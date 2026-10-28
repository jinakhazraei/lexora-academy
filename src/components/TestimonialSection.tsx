"use client";

import Image from "next/image";
import { useState } from "react";
import { Eyebrow } from "@/components/ui";
import { useI18n } from "@/i18n/client";
import { testimonialPhotos } from "@/lib/data";

export function TestimonialSection() {
  const { t } = useI18n();
  const testimonials = t.content.testimonials.map((x, i) => ({ ...x, photo: testimonialPhotos[i] }));
  const [index, setIndex] = useState(0);
  const active = testimonials[index];

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i + testimonials.length - 1) % testimonials.length);

  return (
    <div className="relative overflow-hidden px-6 py-24 text-center md:px-12 md:py-28">
      <Image
        key={active.photo}
        src={active.photo}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-[0.12] grayscale-[30%]"
      />
      <div className="relative mx-auto max-w-[900px]">
        <Eyebrow className="mb-3.5">{t.home.successEyebrow}</Eyebrow>
        <Image
          key={`avatar-${active.photo}`}
          src={active.photo}
          alt={active.name}
          width={72}
          height={72}
          className="mx-auto mb-6 block h-[72px] w-[72px] rounded-full border-2 border-gold-light object-cover"
        />
        <div className="mb-6 font-display text-2xl italic leading-relaxed text-navy md:text-[26px]">
          &ldquo;{active.quote}&rdquo;
        </div>
        <div className="font-sans text-[15px] font-bold text-navy">{active.name}</div>
        <div className="mt-1 font-sans text-[13.5px] font-semibold text-gold">{active.achievement}</div>
        <div className="mt-8 flex justify-center gap-3.5">
          <button
            type="button"
            onClick={prev}
            aria-label={t.home.previous}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-navy bg-transparent text-navy"
          >
            ←
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={t.home.next}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-navy bg-transparent text-navy"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
