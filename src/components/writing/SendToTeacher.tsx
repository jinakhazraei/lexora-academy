"use client";

import { useActionState, useState } from "react";
import { FormMessage, SubmitButton, inputClasses } from "@/components/forms";
import { useI18n } from "@/i18n/client";
import { requestTeacherReview, type ReviewRequestState } from "@/lib/actions/writing";
import type { ReviewStatus } from "@/lib/types";

export function SendToTeacher({ essayId, status }: { essayId: string; status: ReviewStatus }) {
  const { t } = useI18n();
  const r = t.results;
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<ReviewRequestState, FormData>(requestTeacherReview, undefined);

  if (status === "reviewed") {
    return <StatusNote tone="done">{r.reviewed}</StatusNote>;
  }
  if (status === "requested" || state?.ok) {
    return <StatusNote tone="waiting">{r.sent}</StatusNote>;
  }

  if (!open) {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-border-soft bg-cream/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-[13px] leading-relaxed text-muted">{r.sendTitle}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 cursor-pointer rounded-lg bg-navy px-4 py-2.5 font-sans text-[13px] font-bold text-white transition-colors hover:bg-navy-panel"
        >
          {r.sendButton}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border border-border-soft bg-cream/70 p-4">
      <input type="hidden" name="essay_id" value={essayId} />
      <label htmlFor={`note-${essayId}`} className="font-sans text-[13px] font-semibold text-navy">
        {r.sendNote} <span className="font-normal text-meta">{t.common.optional}</span>
      </label>
      <textarea
        id={`note-${essayId}`}
        name="note"
        rows={2}
        maxLength={1000}
        placeholder={r.sendPlaceholder}
        className={inputClasses}
      />
      <FormMessage error={state?.error && r.sendErrors[state.error]} />
      <div className="flex flex-wrap gap-2">
        <SubmitButton variant="navy" pendingLabel={r.sending}>
          {r.sendButton}
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="cursor-pointer rounded-lg px-4 py-2.5 font-sans text-[13px] font-semibold text-muted hover:text-navy"
        >
          {t.common.cancel}
        </button>
      </div>
    </form>
  );
}

function StatusNote({ tone, children }: { tone: "waiting" | "done"; children: React.ReactNode }) {
  return (
    <div
      role="status"
      className={`flex items-center gap-2.5 rounded-xl border p-4 font-sans text-[13px] font-semibold ${
        tone === "done" ? "border-[#cfe3c9] bg-[#f1f8ee] text-[#2f6b2a]" : "border-[#ecdcab] bg-badge-bg text-badge-text"
      }`}
    >
      <span aria-hidden="true">{tone === "done" ? "✓" : "⏳"}</span>
      {children}
    </div>
  );
}
