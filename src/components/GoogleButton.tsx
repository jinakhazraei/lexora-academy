import { signInWithGoogle } from "@/app/auth/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { isGoogleLoginEnabled } from "@/lib/supabase/config";

export function GoogleButton({ next, lang, t, signup = false }: { next: string; lang: Locale; t: Dictionary; signup?: boolean }) {
  if (!isGoogleLoginEnabled) return null;
  return (
    <>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="lang" value={lang} />
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-border-soft bg-white px-5 py-3 font-sans text-[13.5px] font-bold text-navy transition-colors hover:border-navy"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
            <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z" />
          </svg>
          {signup ? t.auth.googleSignup : t.auth.google}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-wide text-meta">
        <span className="h-px flex-1 bg-border-soft" />
        {t.auth.or}
        <span className="h-px flex-1 bg-border-soft" />
      </div>
    </>
  );
}
