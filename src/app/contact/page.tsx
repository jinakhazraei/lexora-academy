import type { Metadata } from "next";
import Image from "next/image";
import { Eyebrow } from "@/components/ui";
import { ContactForm } from "@/components/ContactForm";
import { contact } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact — Lexora Academy",
  description: "Book your free consultation with Lexora Academy in Yerevan.",
};

export default async function ContactPage(props: PageProps<"/contact">) {
  const searchParams = await props.searchParams;
  const courseParam = searchParams?.course;
  const initialCourse = typeof courseParam === "string" ? courseParam : undefined;

  const whatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(
    "Hi! I'd like to book a free consultation at Lexora Academy."
  )}`;
  const emailHref = `mailto:${contact.email}`;

  return (
    <div className="bg-cream px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3.5">Get in Touch</Eyebrow>
          <h1 className="font-display text-[32px] font-semibold text-navy md:text-[42px]">
            Book your free consultation
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ContactForm initialCourse={initialCourse} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col overflow-hidden rounded-[20px] bg-navy">
              <div className="relative h-[140px] w-full">
                <Image
                  src="/images/teacher-students-library.jpg"
                  alt="Lexora Academy classroom"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 p-8">
                <div className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-gold-light">
                  Contact Info
                </div>
                <div className="font-sans text-[15px] text-white">WhatsApp: {contact.whatsappDisplay}</div>
                <div className="font-sans text-[15px] text-white">Email: {contact.email}</div>
                <div className="border-t border-white/12 pt-2 font-sans text-[13.5px] text-white/60">
                  Business hours: {contact.hours}
                </div>
                <div className="mt-1.5 flex gap-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-[#25D366] px-3 py-3 text-center font-sans text-[13px] font-bold text-white transition-colors hover:brightness-95"
                  >
                    WhatsApp Us
                  </a>
                  <a
                    href={emailHref}
                    className="flex-1 rounded-lg border border-white/30 px-3 py-3 text-center font-sans text-[13px] font-bold text-white transition-colors hover:bg-white/10"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
            <div className="min-h-[220px] flex-1 overflow-hidden rounded-[20px]">
              <iframe
                src={contact.mapEmbedSrc}
                className="block h-full min-h-[220px] w-full border-0"
                loading="lazy"
                title="Lexora Academy location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
