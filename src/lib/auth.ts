import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { localizePath, splitLocale } from "@/i18n/config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION } from "@/lib/ielts";
import type { Profile } from "@/lib/types";

export type CurrentUser = { id: string; email: string | null; profile: Profile | null };

/** The signed-in user (verified token) and their profile, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Always per-request: account pages must never be prerendered, even before Supabase keys exist.
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", claims.sub).maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    profile: (profile as Profile | null) ?? null,
  };
});

/**
 * For pages that need a student account. Redirects to login otherwise, in the same
 * language as `nextPath` (e.g. "/hy/dashboard" → "/hy/login?next=…").
 */
export async function requireUser(nextPath: string): Promise<CurrentUser & { profile: Profile }> {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    const { lang } = splitLocale(nextPath);
    const login = `/login?next=${encodeURIComponent(nextPath)}`;
    redirect(lang ? localizePath(lang, login) : login);
  }
  return user as CurrentUser & { profile: Profile };
}

/** For teacher pages. Students are sent to their dashboard. */
export async function requireStaff(nextPath: string) {
  const user = await requireUser(nextPath);
  if (user.profile.role !== "teacher" && user.profile.role !== "admin") {
    const { lang } = splitLocale(nextPath);
    redirect(lang ? localizePath(lang, "/dashboard") : "/dashboard");
  }
  return user;
}

/** True when the student has agreed to the current version of the privacy policy. */
export function hasCurrentConsent(profile: Profile | null | undefined) {
  return Boolean(profile?.privacy_accepted_at && profile.privacy_version === PRIVACY_VERSION);
}

export function isStaff(profile: Profile | null | undefined) {
  return profile?.role === "teacher" || profile?.role === "admin";
}

/** The first word of the student's name, or null if they haven't given one. */
export function firstName(profile: Profile | null | undefined): string | null {
  const name = profile?.full_name?.trim();
  return name ? name.split(/\s+/)[0] : null;
}
