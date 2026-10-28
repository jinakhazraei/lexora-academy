"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/app/auth/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

export function ForgotPasswordForm() {
  const { lang, t } = useI18n();
  const [state, action] = useActionState<AuthFormState, FormData>(requestPasswordReset, undefined);
  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="email" className={labelClasses}>
          {t.auth.email}
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.email} className={inputClasses} />
      </div>
      <FormMessage
        error={state?.error && t.auth.errors[state.error]}
        message={state?.message && fmt(t.auth.messages[state.message], { email: state.email ?? "" })}
      />
      <SubmitButton pendingLabel={t.auth.sending} className="w-full">
        {t.auth.sendReset}
      </SubmitButton>
    </form>
  );
}
