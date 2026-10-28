import Link from "next/link";
import { contact } from "@/lib/data";

const footerLinks = [
  { label: "Writing Feedback", href: "/writing" },
  { label: "Student Login", href: "/login" },
  { label: "How our AI works", href: "/how-our-ai-works" },
  { label: "Privacy Policy", href: "/privacy" },
];

export function Footer() {
  return (
    <div className="bg-navy-deep px-6 py-14 md:px-12">
      <div className="flex flex-wrap justify-between gap-8">
        <div className="font-display text-lg font-bold text-white">
          LEXORA <span className="text-gold">ACADEMY</span>
        </div>
        <div className="flex flex-wrap gap-6 font-sans text-[13px] text-white/50 md:gap-10">
          <div>{contact.location}</div>
          <div>{contact.email}</div>
          <div>{contact.whatsappDisplay}</div>
        </div>
      </div>
      <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 font-sans text-[13px]">
        {footerLinks.map((l) => (
          <Link key={l.href} href={l.href} className="text-white/60 hover:text-gold-light">
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
