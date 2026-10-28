"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { defaultLocale, hasLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { PRIVACY_VERSION, isBand, safeNextPath } from "@/lib/ielts";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthErrorCode = keyof Dictionary["auth"]["errors"];
export type AuthMessageCode = keyof Dictionary["auth"]["messages"];

/** Codes, not text: the form shows them in the visitor's language. */
export type AuthFormState = { error?: AuthErrorCode; message?: AuthMessageCode; email?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function siteOrigin() {
  // Vercel preview deployments use their own address, so sign-up links come back to the preview.
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.VERCEL_ENV !== "preview") {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function formLang(formData: FormData): Locale {
  const value = formData.get("lang");
  return hasLocale(value) ? value : defaultLocale;
}

function authErrorCode(message: string): AuthErrorCode {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "invalid_credentials";
  if (m.includes("email not confirmed")) return "email_not_confirmed";
  if (m.includes("already registered") || m.includes("already been registered")) return "already_registered";
  if (m.includes("password")) return "weak_password";
  if (m.includes("rate limit")) return "rate_limited";
  return "generic";
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: "not_configured" };
  const lang = formLang(formData);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"), `/${lang}/dashboard`);

  if (!EMAIL_RE.test(email) || !password) return { error: "missing_fields", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: authErrorCode(error.message), email };

  redirect(next);
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: "not_configured" };
  const lang = formLang(formData);
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const privacyAccepted = formData.get("privacy") === "on";
  const trainingOptIn = formData.get("training_opt_in") === "on";
  const targetRaw = String(formData.get("target_band") ?? "");
  const next = safeNextPath(formData.get("next"), `/${lang}/dashboard`);

  if (!fullName) return { error: "name_required", email };
  if (!EMAIL_RE.test(email)) return { error: "email_invalid", email };
  if (password.length < 8) return { error: "password_short", email };
  if (!privacyAccepted) return { error: "consent_required", email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName,
        locale: lang,
        privacy_accepted: "true",
        privacy_version: PRIVACY_VERSION,
        training_opt_in: trainingOptIn ? "true" : "false",
        target_band: targetRaw && isBand(Number(targetRaw)) ? targetRaw : "",
      },
    },
  });
  if (error) return { error: authErrorCode(error.message), email };

  // Email confirmation is on: the user has to click the link we sent.
  if (!data.session) return { message: "confirmSent", email };

  redirect(next);
}

export async function signInWithGoogle(formData: FormData) {
  const lang = formLang(formData);
  if (!isSupabaseConfigured) redirect(`/${lang}/login`);
  const next = safeNextPath(formData.get("next"), `/${lang}/dashboard`);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect(`/${lang}/login?error=google`);
  redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: "not_configured" };
  const lang = formLang(formData);
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { error: "email_invalid", email };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(`/${lang}/reset-password`)}`,
  });
  // Same answer whether or not the account exists, so emails can't be probed.
  return { message: "resetSent", email };
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: "not_configured" };
  const lang = formLang(formData);
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "password_short" };
  if (password !== confirm) return { error: "passwords_differ" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "reset_expired" };
  redirect(`/${lang}/dashboard?password=updated`);
}

export async function signOut(formData: FormData) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  // Back to the home page in the same language (without a lang field, the proxy picks it).
  redirect(formData.has("lang") ? `/${formLang(formData)}` : "/");
}
