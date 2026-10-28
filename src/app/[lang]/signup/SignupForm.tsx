"use client";

import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/auth/actions";
import { ConsentFields } from "@/components/ConsentFields";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { fmt } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

const TARGETS = ["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export function SignupForm({ next }: { next: string }) {
  const { lang, t } = useI18n();
  const a = t.auth;
  const [state, action] = useActionState<AuthFormState, FormData>(signUp, undefined);

  if (state?.message) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage message={fmt(a.messages[state.message], { email: state.email ?? "" })} />
        <p className="font-sans text-[13px] leading-relaxed text-muted">{a.checkSpam}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="lang" value={lang} />
      <div>
        <label htmlFor="full_name" className={labelClasses}>
          {a.fullName}
        </label>
        <input id="full_name" name="full_name" type="text" autoComplete="name" required placeholder={a.namePlaceholder} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="email" className={labelClasses}>
          {a.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          placeholder={a.emailPlaceholder}
          className={inputClasses}
        />
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor="password" className={labelClasses}>
            {a.password}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder={a.passwordPlaceholder}
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="target_band" className={labelClasses}>
            {a.targetBand} <span className="font-normal text-meta">{t.common.optional}</span>
          </label>
          <select id="target_band" name="target_band" defaultValue="" className={inputClasses}>
            <option value="">{a.notSure}</option>
            {TARGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ConsentFields />
      <FormMessage error={state?.error && a.errors[state.error]} />
      <SubmitButton pendingLabel={a.creating} className="w-full">
        {a.createButton}
      </SubmitButton>
    </form>
  );
}
