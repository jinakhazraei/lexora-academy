"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { langFrom } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCurrentUser, hasCurrentConsent } from "@/lib/auth";
import { PRIVACY_VERSION, SKILLS, isBand } from "@/lib/ielts";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types";

// Actions return codes; the forms show them in the visitor's language.
export type LogScoreState =
  | { ok?: boolean; error?: keyof Dictionary["dashboard"]["errors"]; message?: "scoreAdded" }
  | undefined;
export type AccountState =
  | { ok?: boolean; error?: keyof Dictionary["account"]["errors"]; message?: "saved" | "essaysDeleted" }
  | undefined;

const SKILL_KEYS = SKILLS.map((s) => s.key);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function signedInUser() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");
  return { ...user, profile: user.profile };
}

/** Every language version of a page (the routes live under /[lang]). */
function revalidate(...paths: string[]) {
  for (const path of paths) revalidatePath(`/[lang]${path}`, "page");
}

/** A practice-test result the student enters themselves. */
export async function logPracticeScore(_prev: LogScoreState, formData: FormData): Promise<LogScoreState> {
  const user = await signedInUser();
  if (!hasCurrentConsent(user.profile)) return { error: "consent" };

  const skill = String(formData.get("skill") ?? "") as Skill;
  const band = Number(formData.get("band"));
  const label = String(formData.get("label") ?? "").trim().slice(0, 120);
  const takenOn = String(formData.get("taken_on") ?? "");

  if (!SKILL_KEYS.includes(skill)) return { error: "skill" };
  if (!isBand(band)) return { error: "band" };
  if (takenOn && (!DATE_RE.test(takenOn) || new Date(takenOn) > new Date(Date.now() + 86_400_000))) {
    return { error: "future" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("skill_scores").insert({
    student_id: user.id,
    skill,
    band,
    source: "self",
    label: label || null,
    taken_on: takenOn || undefined,
    recorded_by: user.id,
  });
  if (error) return { error: "save" };

  revalidate("/dashboard");
  return { ok: true, message: "scoreAdded" };
}

export async function deletePracticeScore(formData: FormData) {
  const user = await signedInUser();
  const id = String(formData.get("score_id") ?? "");
  const supabase = await createClient();
  await supabase.from("skill_scores").delete().eq("id", id).eq("student_id", user.id).eq("source", "self");
  revalidate("/dashboard");
}

/** For students who signed up with Google and haven't accepted the policy yet. */
export async function acceptPrivacy(formData: FormData) {
  const user = await signedInUser();
  if (formData.get("privacy") !== "on") return;
  const optIn = formData.get("training_opt_in") === "on";
  const now = new Date().toISOString();
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({
      privacy_accepted_at: now,
      privacy_version: PRIVACY_VERSION,
      training_opt_in: optIn,
      training_opt_in_at: optIn ? now : null,
    })
    .eq("id", user.id);
  // Separate, best-effort: needs migration 0002.
  if (formData.has("lang")) {
    await supabase.from("profiles").update({ locale: langFrom(formData.get("lang")) }).eq("id", user.id);
  }
  revalidate("/dashboard", "/account");
}

export async function updateProfile(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await signedInUser();
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const targetRaw = String(formData.get("target_band") ?? "");
  const testDate = String(formData.get("test_date") ?? "");

  if (!fullName) return { error: "name" };
  const target = targetRaw ? Number(targetRaw) : null;
  if (target !== null && !isBand(target)) return { error: "target" };
  if (testDate && !DATE_RE.test(testDate)) return { error: "date" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, target_band: target, test_date: testDate || null })
    .eq("id", user.id);
  if (error) return { error: "save" };

  revalidate("/dashboard", "/account");
  return { ok: true, message: "saved" };
}

export async function setTrainingOptIn(formData: FormData) {
  const user = await signedInUser();
  const optIn = formData.get("training_opt_in") === "on";
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ training_opt_in: optIn, training_opt_in_at: optIn ? new Date().toISOString() : null })
    .eq("id", user.id);
  revalidate("/account");
}

export async function deleteAllEssays(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await signedInUser();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") return { error: "confirm" };
  const supabase = await createClient();
  const { error } = await supabase.from("essays").delete().eq("student_id", user.id);
  if (error) return { error: "deleteEssays" };
  revalidate("/dashboard", "/writing/history");
  return { ok: true, message: "essaysDeleted" };
}

/** Permanently deletes the account and everything tied to it. */
export async function deleteAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await signedInUser();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") return { error: "confirm" };
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (err) {
    console.error("Account deletion failed:", err);
    return { error: "deleteAccount" };
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(`/${langFrom(formData.get("lang"))}?account=deleted`);
}
