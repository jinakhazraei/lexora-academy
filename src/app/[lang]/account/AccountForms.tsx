"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { useI18n } from "@/i18n/client";
import { deleteAccount, deleteAllEssays, updateProfile, type AccountState } from "@/lib/actions/dashboard";

const TARGETS = ["4.0", "4.5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"];

function useAccountMessages(state: AccountState) {
  const { t } = useI18n();
  return {
    error: state?.error && t.account.errors[state.error],
    message: state?.message && t.account[state.message],
  };
}

export function ProfileForm({
  fullName,
  targetBand,
  testDate,
}: {
  fullName: string;
  targetBand: number | null;
  testDate: string | null;
}) {
  const { t } = useI18n();
  const a = t.account;
  const [state, action] = useActionState<AccountState, FormData>(updateProfile, undefined);
  const { error, message } = useAccountMessages(state);
  return (
    <form action={action} className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="full_name" className={labelClasses}>
          {a.fullName}
        </label>
        <input id="full_name" name="full_name" defaultValue={fullName} required maxLength={120} className={inputClasses} />
      </div>
      <div>
        <label htmlFor="target_band" className={labelClasses}>
          {a.targetBand}
        </label>
        <select id="target_band" name="target_band" defaultValue={targetBand === null ? "" : Number(targetBand).toFixed(1)} className={inputClasses}>
          <option value="">{t.common.notSet}</option>
          {TARGETS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="test_date" className={labelClasses}>
          {a.testDate} <span className="font-normal text-meta">{t.common.optional}</span>
        </label>
        <input id="test_date" name="test_date" type="date" defaultValue={testDate ?? ""} className={inputClasses} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <SubmitButton pendingLabel={t.common.saving}>{a.saveChanges}</SubmitButton>
        <FormMessage error={error} message={message} />
      </div>
    </form>
  );
}

function ConfirmDeleteForm({
  action,
  buttonLabel,
  description,
}: {
  action: (prev: AccountState, formData: FormData) => Promise<AccountState>;
  buttonLabel: string;
  description: string;
}) {
  const { lang, t } = useI18n();
  const [state, formAction] = useActionState<AccountState, FormData>(action, undefined);
  const { error, message } = useAccountMessages(state);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="lang" value={lang} />
      <p className="font-sans text-[13px] leading-relaxed text-muted">{description}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          name="confirm"
          aria-label={t.account.confirmPlaceholder}
          placeholder={t.account.confirmPlaceholder}
          autoComplete="off"
          className={`${inputClasses} sm:max-w-[260px]`}
        />
        <button
          type="submit"
          className="cursor-pointer rounded-lg border-[1.5px] border-red-700 px-4 py-2.5 font-sans text-[13px] font-bold text-red-700 transition-colors hover:bg-red-700 hover:text-white"
        >
          {buttonLabel}
        </button>
      </div>
      <FormMessage error={error} message={message} />
    </form>
  );
}

export function DeleteEssaysForm() {
  const { t } = useI18n();
  return <ConfirmDeleteForm action={deleteAllEssays} buttonLabel={t.account.deleteEssays} description={t.account.deleteEssaysHint} />;
}

export function DeleteAccountForm() {
  const { t } = useI18n();
  return <ConfirmDeleteForm action={deleteAccount} buttonLabel={t.account.deleteAccount} description={t.account.deleteAccountHint} />;
}
