"use client";

import { useActionState } from "react";
import { deleteAccount, deleteAllEssays, updateProfile, type ActionState } from "@/app/dashboard/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";

const TARGETS = ["4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

export function ProfileForm({
  fullName,
  targetBand,
  testDate,
}: {
  fullName: string;
  targetBand: number | null;
  testDate: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, undefined);
  return (
    <form action={action} className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="full_name" className={labelClasses}>
          Full name
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} required maxLength={120} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="target_band" className={labelClasses}>
          Target band
        </label>
        <select id="target_band" name="target_band" defaultValue={targetBand === null ? "" : Number(targetBand).toFixed(1)} className={inputClasses}>
          <option value="">Not set</option>
          {TARGETS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="test_date" className={labelClasses}>
          IELTS test date <span className="font-normal text-meta">(optional)</span>
        </label>
        <input id="test_date" name="test_date" type="date" defaultValue={testDate ?? ""} className={inputClasses} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
        <FormMessage error={state?.error} message={state?.message} />
      </div>
    </form>
  );
}

function ConfirmDeleteForm({
  action,
  buttonLabel,
  description,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  buttonLabel: string;
  description: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="font-sans text-[13px] leading-relaxed text-muted">{description}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          name="confirm"
          aria-label="Type DELETE to confirm"
          placeholder="Type DELETE to confirm"
          autoComplete="off"
          className={`${inputClasses} sm:max-w-[240px]`}
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg border-[1.5px] border-red-700 px-4 py-2.5 font-sans text-[13px] font-bold text-red-700 transition-colors hover:bg-red-700 hover:text-white"
        >
          {buttonLabel}
        </button>
      </div>
      <FormMessage error={state?.error} message={state?.message} />
    </form>
  );
}

export function DeleteEssaysForm() {
  return (
    <ConfirmDeleteForm
      action={deleteAllEssays}
      buttonLabel="Delete all my essays"
      description="Removes every essay, its AI feedback, teacher reviews and writing scores. Practice-test scores stay."
    />
  );
}

export function DeleteAccountForm() {
  return (
    <ConfirmDeleteForm
      action={deleteAccount}
      buttonLabel="Delete my account"
      description="Permanently deletes your account and everything in it. This can't be undone."
    />
  );
}
