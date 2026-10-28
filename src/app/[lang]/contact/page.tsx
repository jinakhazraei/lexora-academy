import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/Button";
import { ContactForm } from "@/components/ContactForm";
import { Eyebrow } from "@/components/ui";
import { languageAlternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { contact, courseIds, getCourse } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return { title: t.meta.contact, description: t.meta.contactDescription, alternates: languageAlternates(lang, "/contact") };
}

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const { t } = await getI18n();
  const searchParams = await props.searchParams;
  const courseParam = searchParams?.course;
  const initialCourse = typeof courseParam === "string" ? courseParam : undefined;
  const courseOptions = courseIds.map((id) => ({ id, name: getCourse(t, id).name }));

  const whatsappHref = `https://wa.me/${contact.whatsappNumber}?text=${encodeURIComponent(t.contactPage.whatsappMessage)}`;
  const emailHref = `mailto:${contact.email}`;

  return (
    <div className="bg-cream px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-14 text-center">
          <Eyebrow className="mb-3.5">{t.contactPage.eyebrow}</Eyebrow>
          <h1 className="font-display text-[32px] font-semibold text-navy md:text-[42px]">{t.contactPage.title}</h1>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ContactForm initialCourse={initialCourse} courses={courseOptions} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col overflow-hidden rounded-[20px] bg-navy">
              <div className="relative h-[140px] w-full">
                <Image
                  src="/images/teacher-students-library.jpg"
                  alt={t.contactPage.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-4 p-8">
                <div className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-gold-light">{t.contactPage.infoTitle}</div>
                <div className="font-sans text-[15px] text-white">
                  {t.contactPage.whatsapp}: {contact.whatsappDisplay}
                </div>
                <div className="font-sans text-[15px] text-white">
                  {t.contactPage.email}: {contact.email}
                </div>
                <div className="border-t border-white/12 pt-2 font-sans text-[13.5px] text-white/60">
                  {t.contactPage.hours}: {t.content.hours}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 whitespace-nowrap rounded-lg bg-[#25D366] px-3 py-3 text-center font-sans text-[13px] font-bold text-white transition-colors hover:text-white hover:brightness-95"
                  >
                    {t.contactPage.whatsappButton}
                  </a>
                  <a
                    href={emailHref}
                    className="flex-1 whitespace-nowrap rounded-lg border border-white/30 px-3 py-3 text-center font-sans text-[13px] font-bold text-white transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t.contactPage.emailButton}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 rounded-[20px] border border-border-soft bg-white p-7">
              <div className="font-sans text-[13px] font-bold uppercase tracking-[0.08em] text-navy">{t.contactPage.howTitle}</div>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-badge-bg" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8a6a10" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="12" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </span>
                <p className="font-sans text-[14px] leading-relaxed text-ink">{t.contactPage.howOnline}</p>
              </div>
              <div className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-badge-bg" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#8a6a10" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 11l9-7 9 7" />
                    <path d="M5 10v10h14V10" />
                  </svg>
                </span>
                <p className="font-sans text-[14px] leading-relaxed text-ink">{t.contactPage.howHome}</p>
              </div>
              <Button href="/pricing" variant="outline-navy" className="mt-auto self-start">
                {t.contactPage.howPricing}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
