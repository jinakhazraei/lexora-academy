import Link from "next/link";

export const checkboxClasses = "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-gold";
const boxClasses = checkboxClasses;

/** The two consent choices: storing work (required) and helping train our model (optional). */
export function ConsentFields({
  showTraining = true,
  requiredName = "privacy",
}: {
  showTraining?: boolean;
  requiredName?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border-soft bg-cream/60 p-4">
      <label className="flex cursor-pointer gap-3 font-sans text-[13px] leading-relaxed text-ink">
        <input type="checkbox" name={requiredName} required className={boxClasses} />
        <span>
          I&apos;ve read the{" "}
          <Link href="/privacy" target="_blank" className="font-semibold">
            Privacy Policy
          </Link>{" "}
          and agree that Lexora Academy can store my essays, scores and teacher feedback to run my account.{" "}
          <span className="text-meta">(required)</span>
        </span>
      </label>
      {showTraining && (
        <label className="flex cursor-pointer gap-3 font-sans text-[13px] leading-relaxed text-ink">
          <input type="checkbox" name="training_opt_in" className={boxClasses} />
          <span>
            Help improve Lexora&apos;s scoring: allow my essays, with my name and details removed, to be used to
            train our own model. You can change this anytime. <span className="text-meta">(optional)</span>
          </span>
        </label>
      )}
    </div>
  );
}
