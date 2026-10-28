"use client";

import { useActionState, useEffect, useRef } from "react";
import { logPracticeScore, type ActionState } from "@/app/dashboard/actions";
import { FormMessage, SubmitButton, inputClasses, labelClasses } from "@/components/forms";
import { SKILLS } from "@/lib/ielts";

const BANDS = Array.from({ length: 19 }, (_, i) => (i / 2).toFixed(1)).reverse();

export function LogScoreForm() {
  const [state, action] = useActionState<ActionState, FormData>(logPracticeScore, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.6fr)_minmax(0,1fr)_auto] lg:items-end">
      <div>
        <label htmlFor="log-skill" className={labelClasses}>
          Skill
        </label>
        <select id="log-skill" name="skill" required defaultValue="listening" className={inputClasses}>
          {SKILLS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="log-band" className={labelClasses}>
          Band
        </label>
        <select id="log-band" name="band" required defaultValue="6.0" className={inputClasses}>
          {BANDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="log-label" className={labelClasses}>
          Test or source <span className="font-normal text-meta">(optional)</span>
        </label>
        <input id="log-label" name="label" type="text" maxLength={120} placeholder="e.g. Cambridge 18, Test 2" className={inputClasses} />
      </div>
      <div>
        <label htmlFor="log-date" className={labelClasses}>
          Date
        </label>
        <input id="log-date" name="taken_on" type="date" max={today} defaultValue={today} className={inputClasses} />
      </div>
      <SubmitButton pendingLabel="Adding…" variant="navy" className="h-[46px]">
        Add score
      </SubmitButton>
      {(state?.error || state?.message) && (
        <div className="sm:col-span-2 lg:col-span-5">
          <FormMessage error={state?.error} message={state?.message} />
        </div>
      )}
    </form>
  );
}
