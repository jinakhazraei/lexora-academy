"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { PRIVACY_VERSION, isBand, safeNextPath } from "@/lib/ielts";

export type AuthFormState = { error?: string; message?: string; email?: string } | undefined;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOT_CONFIGURED = "Student accounts aren't switched on yet. Please contact us to get access.";

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

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Please try again.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox for our link.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try logging in instead.";
  if (m.includes("password")) return message;
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!EMAIL_RE.test(email) || !password) return { error: "Enter your email and password.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyAuthError(error.message), email };

  redirect(next);
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const privacyAccepted = formData.get("privacy") === "on";
  const trainingOptIn = formData.get("training_opt_in") === "on";
  const targetRaw = String(formData.get("target_band") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!fullName) return { error: "Please enter your name.", email };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", email };
  if (password.length < 8) return { error: "Your password needs at least 8 characters.", email };
  if (!privacyAccepted) {
    return { error: "Please accept the Privacy Policy so we can store your essays and scores.", email };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      data: {
        full_name: fullName,
        privacy_accepted: "true",
        privacy_version: PRIVACY_VERSION,
        training_opt_in: trainingOptIn ? "true" : "false",
        target_band: targetRaw && isBand(Number(targetRaw)) ? targetRaw : "",
      },
    },
  });
  if (error) return { error: friendlyAuthError(error.message), email };

  // Email confirmation is on: the user has to click the link we sent.
  if (!data.session) {
    return {
      message: `We've sent a confirmation link to ${email}. Open it to finish creating your account.`,
      email,
    };
  }

  redirect(next);
}

export async function signInWithGoogle(formData: FormData) {
  if (!isSupabaseConfigured) redirect("/login");
  const next = safeNextPath(formData.get("next"));
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect(`/login?error=google`);
  redirect(data.url);
}

export async function requestPasswordReset(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email address.", email };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/callback?next=/reset-password`,
  });
  // Same answer whether or not the account exists, so emails can't be probed.
  return { message: `If there's an account for ${email}, a reset link is on its way.`, email };
}

export async function updatePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Your password needs at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Your reset link has expired. Please request a new one." };
  redirect("/dashboard?password=updated");
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
