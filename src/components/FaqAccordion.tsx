"use client";

import { useState } from "react";
import { faqItems } from "@/lib/data";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto max-w-[800px] px-6 pb-24 md:px-12 md:pb-28">
      <h2 className="mb-11 text-center font-display text-[28px] font-semibold text-navy md:text-[34px]">
        Frequently asked questions
      </h2>
      {faqItems.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="border-b border-border-soft py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 bg-transparent text-left"
            >
              <span className="font-sans text-base font-semibold text-navy">{item.q}</span>
              <span
                className={`shrink-0 font-sans text-xl text-gold transition-transform duration-200 ${
                  isOpen ? "rotate-45" : "rotate-0"
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="mt-3 max-w-[640px] font-sans text-[14.5px] leading-relaxed text-muted">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
