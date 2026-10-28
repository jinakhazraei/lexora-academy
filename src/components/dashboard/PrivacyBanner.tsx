"use client";

import { ConsentFields } from "@/components/ConsentFields";
import { SubmitButton } from "@/components/forms";
import { useI18n } from "@/i18n/client";
import { acceptPrivacy } from "@/lib/actions/dashboard";

/** Shown to students who haven't accepted the policy yet (e.g. signed up with Google). */
export function PrivacyBanner() {
  const { lang, t } = useI18n();
  return (
    <form action={acceptPrivacy} className="mb-8 rounded-[20px] border border-[#ecdcab] bg-[#fffaf0] p-5 sm:p-6">
      <input type="hidden" name="lang" value={lang} />
      <div className="mb-1 font-sans text-[15px] font-bold text-navy">{t.dashboard.privacyTitle}</div>
      <p className="mb-4 font-sans text-[13.5px] leading-relaxed text-muted">{t.dashboard.privacyText}</p>
      <ConsentFields />
      <SubmitButton pendingLabel={t.common.saving} className="mt-4">
        {t.dashboard.saveChoice}
      </SubmitButton>
    </form>
  );
}
