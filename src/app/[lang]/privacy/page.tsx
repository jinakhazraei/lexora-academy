import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "@/components/LocaleLink";
import { Eyebrow } from "@/components/ui";
import { fmt, formatDate, localeNames } from "@/i18n/config";
import { languageAlternates } from "@/i18n/metadata";
import { rich } from "@/i18n/rich";
import { getI18n } from "@/i18n/server";
import { contact } from "@/lib/data";
import { PRIVACY_VERSION } from "@/lib/ielts";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t.meta.privacy,
    description: t.meta.privacyDescription,
    alternates: languageAlternates(lang, "/privacy"),
  };
}

// Service providers that process data for us. Keep this list accurate.
const PROCESSORS = [
  { key: "supabase", name: "Supabase" },
  { key: "vercel", name: "Vercel" },
  { key: "anthropic", name: "Anthropic" },
  { key: "resend", name: "Resend" },
] as const;

/** "Account details: your name…" → the label before the colon in bold. */
function withLabel(text: string, render: (s: string) => ReactNode) {
  const m = text.match(/^(.{2,45}?)([:\u055D])\s([\s\S]*)$/);
  if (!m) return render(text);
  return (
    <>
      <strong>
        {m[1]}
        {m[2]}
      </strong>{" "}
      {render(m[3])}
    </>
  );
}

export default async function PrivacyPage() {
  const { lang, t } = await getI18n();
  const p = t.privacy;

  // Placeholders the policy text can use.
  const parts = {
    email: <a href={`mailto:${contact.email}`}>{contact.email}</a>,
    whatsapp: <span className="whitespace-nowrap">{contact.whatsappDisplay}</span>,
    howAi: <Link href="/how-our-ai-works">{p.linkHowAi}</Link>,
    account: <Link href="/account">{p.linkAccount}</Link>,
  };
  const render = (s: string) => rich(s, parts);

  return (
    <div className="bg-cream px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto max-w-[780px]">
        <Eyebrow className="mb-3.5">{p.eyebrow}</Eyebrow>
        <h1 className="mb-3 font-display text-[34px] font-semibold text-navy md:text-[44px]">{p.title}</h1>
        <p className="mb-4 font-sans text-[14px] text-meta">
          {fmt(p.effective, {
            date: formatDate(PRIVACY_VERSION, lang, { month: "long" }),
            version: PRIVACY_VERSION,
          })}
        </p>
        {p.englishPrevails && (
          <p className="mb-10 rounded-lg border border-border-soft bg-white px-4 py-3 font-sans text-[13px] leading-relaxed text-muted">
            {p.englishPrevails}{" "}
            <Link href="/en/privacy" hrefLang="en" className="font-semibold">
              {localeNames.en.native} →
            </Link>
          </p>
        )}
        {!p.englishPrevails && <div className="mb-6" />}

        <div className="mb-12 rounded-[20px] bg-navy p-7">
          <div className="mb-4 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-gold-light">{p.shortTitle}</div>
          <ul className="flex flex-col gap-2.5">
            {p.short.map((s) => (
              <li key={s} className="flex gap-2.5 font-sans text-[14.5px] leading-relaxed text-white/85">
                <span className="text-gold-light">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-10 font-sans text-[15px] leading-relaxed text-ink [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:text-navy [&_li]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
          {p.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {/* Section 3 has its paragraph after the list; the others have no list or no paragraph. */}
              {section.bullets && (
                <ul>
                  {section.bullets.map((b) => (
                    <li key={b}>{withLabel(b, render)}</li>
                  ))}
                </ul>
              )}
              {section.processors && (
                <ul className="!pl-10">
                  {PROCESSORS.map((proc) => (
                    <li key={proc.key}>
                      <strong>{proc.name}</strong> — {p.processors[proc.key]}.
                    </li>
                  ))}
                </ul>
              )}
              {section.paragraphs?.map((para) => (
                <p key={para}>{render(para)}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
