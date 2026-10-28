"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/app/auth/actions";
import { AuthShell } from "@/components/AuthShell";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState<AuthFormState, FormData>(requestPasswordReset, undefined);

  return (
    <AuthShell eyebrow="Student Login" title="Reset your password" subtitle="Enter your email and we'll send you a link to choose a new password.">
      <form action={action} className="flex flex-col gap-[18px]">
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.email} className={inputClasses} />
        </div>
        <FormMessage error={state?.error} message={state?.message} />
        <SubmitButton pendingLabel="Sending…" className="w-full">
          Send reset link
        </SubmitButton>
      </form>
      <p className="mt-6 font-sans text-sm text-muted">
        Remembered it? <Link href="/login" className="font-semibold">Back to login</Link>
      </p>
    </AuthShell>
  );
}
