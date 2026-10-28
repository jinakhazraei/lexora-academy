"use client";

import { useActionState, useEffect, useRef } from "react";
import { recordTeacherScore, submitReview, type TeacherActionState } from "@/app/teacher/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { SKILLS, formatBand } from "@/lib/ielts";

const BANDS = Array.from({ length: 19 }, (_, i) => (i / 2).toFixed(1)).reverse();

export function ReviewForm({ essayId, aiBand }: { essayId: string; aiBand: number }) {
  const [state, action] = useActionState<TeacherActionState, FormData>(submitReview, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="essay_id" value={essayId} />
      <div>
        <label htmlFor="comment" className={labelClasses}>
          Your feedback to the student
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={7}
          required
          maxLength={5000}
          placeholder="What did the AI get right or wrong? What should they work on next?"
          className={inputClasses}
        />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="sm:w-[220px]">
          <label htmlFor="overall_band" className={labelClasses}>
            Your band <span className="font-normal text-meta">(optional · AI said {formatBand(aiBand)})</span>
          </label>
          <select id="overall_band" name="overall_band" defaultValue="" className={inputClasses}>
            <option value="">No band</option>
            {BANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton pendingLabel="Sending…" className="h-[46px]">
          Send review
        </SubmitButton>
      </div>
      <p className="font-sans text-[12px] text-meta">
        A band you give is saved as a teacher-assessed writing score on the student&apos;s dashboard.
      </p>
      <FormMessage error={state?.error} message={state?.message} />
    </form>
  );
}

export function TeacherScoreForm({ studentId }: { studentId: string }) {
  const [state, action] = useActionState<TeacherActionState, FormData>(recordTeacherScore, undefined);
  const ref = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="hidden" name="student_id" value={studentId} />
      <div>
        <label htmlFor="t-skill" className={labelClasses}>
          Skill
        </label>
        <select id="t-skill" name="skill" defaultValue="speaking" className={inputClasses}>
          {SKILLS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="t-band" className={labelClasses}>
          Band
        </label>
        <select id="t-band" name="band" defaultValue="6.0" className={inputClasses}>
          {BANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="t-label" className={labelClasses}>
          Test or note <span className="font-normal text-meta">(optional)</span>
        </label>
        <input id="t-label" name="label" maxLength={120} placeholder="e.g. Mock speaking, week 4" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="t-date" className={labelClasses}>
          Date
        </label>
        <input id="t-date" name="taken_on" type="date" defaultValue={today} className={inputClasses} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <SubmitButton variant="navy" pendingLabel="Saving…">
          Record score
        </SubmitButton>
        <FormMessage error={state?.error} message={state?.message} />
      </div>
    </form>
  );
}
