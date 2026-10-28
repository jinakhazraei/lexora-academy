"use client";

import Link from "@/components/LocaleLink";
import { useI18n } from "@/i18n/client";
import { contact } from "@/lib/data";

export function Footer() {
  const { t } = useI18n();
  const links = [
    { label: t.footer.pricing, href: "/pricing" },
    { label: t.footer.writing, href: "/writing" },
    { label: t.footer.login, href: "/login" },
    { label: t.footer.howAi, href: "/how-our-ai-works" },
    { label: t.footer.privacy, href: "/privacy" },
  ];

  return (
    <div className="bg-navy-deep px-6 py-14 md:px-12">
      <div className="flex flex-wrap justify-between gap-8">
        <div className="font-display text-lg font-bold text-white">
          LEXORA <span className="text-gold">ACADEMY</span>
        </div>
        <div className="flex flex-wrap gap-6 font-sans text-[13px] text-white/50 md:gap-10">
          <div>{t.footer.location}</div>
          <div>{contact.email}</div>
          <div>{contact.whatsappDisplay}</div>
        </div>
      </div>
      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 font-sans text-[13px]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-white/60 hover:text-gold-light">
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
