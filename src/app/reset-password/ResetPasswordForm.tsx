"use client";

import { useActionState } from "react";
import { updatePassword, type AuthFormState } from "@/app/auth/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";

export function ResetPasswordForm() {
  const [state, action] = useActionState<AuthFormState, FormData>(updatePassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-[18px]">
      <div>
        <label htmlFor="password" className={labelClasses}>
          New password
        </label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className={inputClasses} />
      </div>
      <div>
        <label htmlFor="confirm" className={labelClasses}>
          Repeat new password
        </label>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required className={inputClasses} />
      </div>
      <FormMessage error={state?.error} />
      <SubmitButton pendingLabel="Saving…" className="w-full">
        Save new password
      </SubmitButton>
    </form>
  );
}
