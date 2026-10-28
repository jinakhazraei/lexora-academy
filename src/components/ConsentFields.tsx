"use client";

import Link from "@/components/LocaleLink";
import { useI18n } from "@/i18n/client";
import { rich } from "@/i18n/rich";

export const checkboxClasses = "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold";

/** The two consent choices: storing work (required) and helping train our model (optional). */
export function ConsentFields({ showTraining = true }: { showTraining?: boolean }) {
  const { t } = useI18n();
  const policyLink = (
    <Link href="/privacy" target="_blank" className="font-semibold">
      {t.auth.privacyPolicy}
    </Link>
  );
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-soft bg-cream/60 p-4">
      <label className="flex cursor-pointer gap-3 font-sans text-[13px] leading-relaxed text-ink">
        <input type="checkbox" name="privacy" required className={checkboxClasses} />
        <span>
          {rich(t.auth.consentRequired, { policy: policyLink })} <span className="text-meta">{t.common.required}</span>
        </span>
      </label>
      {showTraining && (
        <label className="flex cursor-pointer gap-3 font-sans text-[13px] leading-relaxed text-ink">
          <input type="checkbox" name="training_opt_in" className={checkboxClasses} />
          <span>
            {t.auth.consentTraining} <span className="text-meta">{t.common.optional}</span>
          </span>
        </label>
      )}
    </div>
  );
}
