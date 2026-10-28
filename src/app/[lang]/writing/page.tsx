import type { Metadata } from "next";
import Link from "@/components/LocaleLink";
import { Eyebrow } from "@/components/ui";
import { WritingStudio } from "@/components/writing/WritingStudio";
import { languageAlternates } from "@/i18n/metadata";
import { getI18n } from "@/i18n/server";
import { getCurrentUser, hasCurrentConsent } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  const { lang, t } = await getI18n();
  return {
    title: t.meta.writing,
    description: t.meta.writingDescription,
    alternates: languageAlternates(lang, "/writing"),
  };
}

export default async function WritingPage() {
  const { t } = await getI18n();
  const w = t.writing;
  const user = await getCurrentUser();

  return (
    <div className="bg-cream px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-3">{w.eyebrow}</Eyebrow>
            <h1 className="mb-3 font-display text-[32px] font-semibold leading-tight text-navy md:text-[42px]">{w.title}</h1>
            <p className="max-w-[620px] font-sans text-[16px] leading-relaxed text-muted">{w.intro}</p>
          </div>
          <div className="flex shrink-0 gap-5 font-sans text-[13.5px] font-semibold">
            {user && <Link href="/writing/history">{w.myEssays}</Link>}
            <Link href="/how-our-ai-works">{w.howAi}</Link>
          </div>
        </div>

        <WritingStudio
          signedIn={Boolean(user?.profile)}
          needsConsent={Boolean(user?.profile && !hasCurrentConsent(user.profile))}
          accountsEnabled={isSupabaseConfigured}
        />
      </div>
    </div>
  );
}
