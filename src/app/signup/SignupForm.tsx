"use client";

import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/auth/actions";
import { ConsentFields } from "@/components/ConsentFields";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";

const TARGETS = ["5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signUp, undefined);

  if (state?.message) {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage message={state.message} />
        <p className="font-sans text-[13px] leading-relaxed text-muted">
          Didn&apos;t get it? Check your spam folder, or wait a minute and sign up again with the same email.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="full_name" className={labelClasses}>
          Full name
        </label>
        <input id="full_name" name="full_name" type="text" autoComplete="name" required placeholder="Your name" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          placeholder="you@email.com"
          className={inputClasses}
        />
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="At least 8 characters"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="target_band" className={labelClasses}>
            Target band <span className="font-normal text-meta">(optional)</span>
          </label>
          <select id="target_band" name="target_band" defaultValue="" className={inputClasses}>
            <option value="">Not sure yet</option>
            {TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <ConsentFields />
      <FormMessage error={state?.error} />
      <SubmitButton pendingLabel="Creating your account…" className="w-full">
        Create student account
      </SubmitButton>
    </form>
  );
}
