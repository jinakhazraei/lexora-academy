"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ComponentProps } from "react";
import { defaultLocale, hasLocale, localizePath } from "@/i18n/config";

/**
 * next/link that keeps the visitor in their language: "/pricing" → "/hy/pricing".
 * External links, API routes and already-prefixed paths are left as they are.
 */
export default function LocaleLink({ href, ...props }: ComponentProps<typeof Link>) {
  const params = useParams<{ lang?: string }>();
  const lang = hasLocale(params?.lang) ? params.lang : defaultLocale;
  const localized = typeof href === "string" ? localizePath(lang, href) : href;
  return <Link href={localized} {...props} />;
}
