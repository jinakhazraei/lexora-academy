import Image from "next/image";
import { signOut } from "@/app/auth/actions";
import { Eyebrow } from "@/components/ui";
import type { Dictionary } from "@/i18n/dictionaries";

export function AuthShell({
  t,
  eyebrow,
  title,
  subtitle,
  children,
}: {
  t: Dictionary;
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream px-4 py-14 md:px-12 md:py-20">
      <div className="mx-auto grid max-w-[1000px] grid-cols-1 overflow-hidden rounded-[20px] border border-border-soft bg-white shadow-[0_8px_24px_rgba(15,27,51,0.05)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative hidden min-h-[520px] bg-navy md:block">
          <Image src="/images/hands-typing-notebook.jpg" alt="" fill sizes="(max-width: 768px) 0px, 440px" className="object-cover opacity-40" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(10,20,40,0.55),rgba(15,27,51,0.92))]" />
          <div className="relative flex h-full flex-col justify-end p-9">
            <div className="mb-3 font-display text-[26px] font-semibold leading-snug text-white">{t.auth.sideTitle}</div>
            <p className="font-sans text-sm leading-relaxed text-white/65">{t.auth.sideText}</p>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <Eyebrow className="mb-2.5">{eyebrow}</Eyebrow>
          <h1 className="mb-2 font-display text-[28px] font-semibold text-navy md:text-[32px]">{title}</h1>
          {subtitle && <p className="mb-7 font-sans text-sm leading-relaxed text-muted">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Signed in, but no profile row exists — the database setup step was skipped, or the
 * account was created before it ran. Shown instead of redirecting, to avoid a login loop.
 */
export function MissingProfileNotice({ t }: { t: Dictionary }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3.5 font-sans text-[13px] leading-relaxed text-red-700">
        {t.auth.missingProfile}
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="cursor-pointer rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white"
        >
          {t.common.signOut}
        </button>
      </form>
    </div>
  );
}

export function NotConfiguredNotice({ t }: { t: Dictionary }) {
  return (
    <div className="rounded-lg border border-border-soft bg-badge-bg px-4 py-3.5 font-sans text-[13px] leading-relaxed text-badge-text">
      {t.auth.notConfigured}
    </div>
  );
}
