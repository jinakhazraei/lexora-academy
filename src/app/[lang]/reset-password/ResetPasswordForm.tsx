"use client";

import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "@/app/auth/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { useI18n } from "@/i18n/client";

export function ResetPasswordForm() {
  const { lang, t } = useI18n();
  const [state, action] = useActionState<AuthFormState, FormData>(updatePassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="password" className={labelClasses}>
          {t.auth.newPassword}
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="confirm" className={labelClasses}>
          {t.auth.repeatPassword}
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputClasses} />
      </div>
      <FormMessage error={state?.error && t.auth.errors[state.error]} />
      <SubmitButton pendingLabel={t.common.saving} className="w-full">
        {t.auth.savePassword}
      </SubmitButton>
    </form>
  );
}
