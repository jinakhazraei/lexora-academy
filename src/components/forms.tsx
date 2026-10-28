"use client";

import { useFormStatus } from "react-dom";

export const inputClasses =
  "w-full rounded-lg border border-border-soft bg-white px-3.5 py-3 font-sans text-sm text-ink placeholder:text-placeholder focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20";
export const labelClasses = "mb-1.5 block font-sans text-[13px] font-semibold text-navy";

export function SubmitButton({
  children,
  pendingLabel,
  variant = "gold",
  className = "",
  disabled,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "gold" | "navy" | "outline-navy";
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const variants = {
    gold: "bg-gold text-navy hover:brightness-95",
    navy: "bg-navy text-white hover:bg-navy-panel",
    "outline-navy": "border-[1.5px] border-navy bg-transparent text-navy hover:bg-navy hover:text-white",
  };
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex cursor-pointer items-center justify-center rounded-lg px-5 py-3 font-sans text-[13.5px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}

export function FormMessage({ error, message }: { error?: string; message?: string }) {
  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 font-sans text-[13px] font-semibold text-red-700">
        {error}
      </div>
    );
  }
  if (message) {
    return (
      <div role="status" className="rounded-lg border border-[#cfe3c9] bg-[#f1f8ee] px-3.5 py-3 font-sans text-[13px] font-semibold text-[#2f6b2a]">
        {message}
      </div>
    );
  }
  return null;
}
