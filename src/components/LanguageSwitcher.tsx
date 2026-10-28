"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasLocale, localeNames, locales, splitLocale, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

/** Same page, another language: "/hy/pricing" → "/ru/pricing". */
function switchHref(pathname: string, to: Locale) {
  const { rest } = splitLocale(pathname);
  return `/${to}${rest === "/" ? "" : rest}`;
}

export function LanguageSwitcher() {
  const params = useParams<{ lang?: string }>();
  const current: Locale = hasLocale(params?.lang) ? params.lang : "en";
  const pathname = usePathname() ?? "/";
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  // Full page loads (plain <a>), so the new language's fonts and server text load cleanly.
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t.nav.language}: ${localeNames[current].native}`}
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-soft bg-white/60 px-3 py-2 font-sans text-[12.5px] font-bold text-navy hover:border-navy"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <ellipse cx="12" cy="12" rx="4" ry="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
        {localeNames[current].short}
        <svg viewBox="0 0 12 12" width="9" height="9" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border-soft bg-white py-1 shadow-[0_12px_32px_rgba(15,27,51,0.14)]">
          {locales.map((l) => (
            <a
              key={l}
              role="menuitem"
              href={switchHref(pathname, l)}
              hrefLang={l}
              lang={l}
              aria-current={l === current ? "true" : undefined}
              className={`flex items-center justify-between px-4 py-2.5 font-sans text-[14px] ${
                l === current ? "bg-cream font-bold text-navy" : "text-ink hover:bg-cream hover:text-navy"
              }`}
            >
              {localeNames[l].native}
              {l === current && <span className="text-gold">✓</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
