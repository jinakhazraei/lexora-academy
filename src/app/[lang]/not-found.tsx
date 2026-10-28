"use client";

import { Button } from "@/components/Button";
import { useI18n } from "@/i18n/client";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="bg-cream px-6 py-28 text-center md:px-12">
      <div className="mb-3 font-display text-[72px] font-semibold leading-none text-gold-light">404</div>
      <h1 className="mb-3 font-display text-[30px] font-semibold text-navy">{t.notFound.title}</h1>
      <p className="mb-8 font-sans text-[15px] text-muted">{t.notFound.text}</p>
      <Button href="/">{t.notFound.home}</Button>
    </div>
  );
}
