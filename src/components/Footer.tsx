import { contact } from "@/lib/data";

export function Footer() {
  return (
    <div className="flex flex-wrap justify-between gap-8 bg-navy-deep px-6 py-14 md:px-12">
      <div className="font-display text-lg font-bold text-white">
        LEXORA <span className="text-gold">ACADEMY</span>
      </div>
      <div className="flex flex-wrap gap-6 font-sans text-[13px] text-white/50 md:gap-10">
        <div>{contact.location}</div>
        <div>{contact.email}</div>
        <div>{contact.whatsappDisplay}</div>
      </div>
    </div>
  );
}
