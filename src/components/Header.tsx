"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navLinks } from "@/lib/data";
import { AccountButton } from "@/components/AccountButton";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 border-b border-[var(--color-border-soft)] bg-[var(--color-cream)]/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 py-3 md:px-12 md:py-[18px]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/images/lexora-mark.jpg"
            alt="Lexora Academy mark"
            width={68}
            height={68}
            className="h-12 w-12 object-contain md:h-[68px] md:w-[68px]"
            priority
          />
          <div className="font-display text-lg font-bold tracking-wide text-navy md:text-xl">
            LEXORA{" "}
            <span className="font-sans text-[11px] font-bold tracking-[0.15em] text-gold md:text-[13px]">
              ACADEMY
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          <nav className="flex items-center gap-7 font-sans text-sm font-semibold text-navy">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-navy hover:text-gold">
                {link.label}
              </Link>
            ))}
          </nav>
          <AccountButton />
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          className="flex flex-col gap-1 p-1.5 lg:hidden"
        >
          <span className="h-0.5 w-[22px] bg-navy" />
          <span className="h-0.5 w-[22px] bg-navy" />
          <span className="h-0.5 w-[22px] bg-navy" />
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col bg-navy px-5 pb-4 pt-2 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/10 py-2.5 font-sans text-sm font-semibold text-white last:border-b-0 hover:text-gold-light"
            >
              {link.label}
            </Link>
          ))}
          <AccountButton variant="menu" onNavigate={() => setMobileOpen(false)} />
        </nav>
      )}
    </div>
  );
}
