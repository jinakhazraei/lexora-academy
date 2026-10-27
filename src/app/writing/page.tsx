import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { WritingStudio } from "@/components/writing/WritingStudio";
import { getCurrentUser, hasCurrentConsent } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "AI Writing Feedback — Lexora Academy",
  description:
    "Write an IELTS Task 2 essay and get an estimated band, four-criteria feedback and grammar corrections — then send it to your teacher.",
};

export default async function WritingPage() {
  const user = await getCurrentUser();

  return (
    <div className="bg-cream px-4 py-14 sm:px-6 md:px-12 md:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-3">AI Writing Feedback</Eyebrow>
            <h1 className="mb-3 font-display text-[32px] font-semibold leading-tight text-navy md:text-[42px]">
              Get feedback on your Task 2 essay
            </h1>
            <p className="max-w-[620px] font-sans text-[16px] leading-relaxed text-muted">
              Pick a question, write your answer and get an estimated band with notes on all four IELTS criteria.
              Your teacher can review any result.
            </p>
          </div>
          <div className="flex shrink-0 gap-5 font-sans text-[13.5px] font-semibold">
            {user && <Link href="/writing/history">My essays</Link>}
            <Link href="/how-our-ai-works">How our AI works</Link>
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
