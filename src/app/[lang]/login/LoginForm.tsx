"use client";

import { useActionState } from "react";
import { signIn, type AuthErrorCode, type AuthFormState } from "@/app/auth/actions";
import Link from "@/components/LocaleLink";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { useI18n } from "@/i18n/client";

export function LoginForm({ next, initialError }: { next: string; initialError?: AuthErrorCode }) {
  const { lang, t } = useI18n();
  const [state, action] = useActionState<AuthFormState, FormData>(signIn, initialError ? { error: initialError } : undefined);

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="email" className={labelClasses}>
          {t.auth.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          placeholder={t.auth.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="password" className={labelClasses}>
            {t.auth.password}
          </label>
          <Link href="/forgot-password" className="font-sans text-xs font-semibold">
            {t.auth.forgotLink}
          </Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClasses} />
      </div>
      <FormMessage error={state?.error && t.auth.errors[state.error]} />
      <SubmitButton pendingLabel={t.auth.loggingIn} className="w-full">
        {t.auth.loginButton}
      </SubmitButton>
    </form>
  );
}
