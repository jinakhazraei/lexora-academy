"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action] = useActionState<AuthFormState, FormData>(signIn, initialError ? { error: initialError } : undefined);

  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <input type="hidden" name="next" value={next} />
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
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className={labelClasses}>
            Password
          </label>
          <Link href="/forgot-password" className="font-sans text-xs font-semibold">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </div>
      <FormMessage error={state?.error} message={state?.message} />
      <SubmitButton pendingLabel="Logging in…" className="w-full">
        Log in
      </SubmitButton>
    </form>
  );
}
