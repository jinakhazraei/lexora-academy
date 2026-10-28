"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, hasCurrentConsent } from "@/lib/auth";
import { PRIVACY_VERSION, SKILLS, isBand } from "@/lib/ielts";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types";

export type ActionState = { ok?: boolean; error?: string; message?: string } | undefined;

const SKILL_KEYS = SKILLS.map((s) => s.key);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

async function signedInUser() {
  const user = await getCurrentUser();
  if (!user?.profile) redirect("/login");
  return { ...user, profile: user.profile };
}

/** A practice-test result the student enters themselves. */
export async function logPracticeScore(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  if (!hasCurrentConsent(user.profile)) return { error: "Please accept the Privacy Policy first (see the banner above)." };

  const skill = String(formData.get("skill") ?? "") as Skill;
  const band = Number(formData.get("band"));
  const label = String(formData.get("label") ?? "").trim().slice(0, 120);
  const takenOn = String(formData.get("taken_on") ?? "");

  if (!SKILL_KEYS.includes(skill)) return { error: "Choose a skill." };
  if (!isBand(band)) return { error: "Choose a band between 0 and 9." };
  if (takenOn && (!DATE_RE.test(takenOn) || new Date(takenOn) > new Date(Date.now() + 86_400_000))) {
    return { error: "Choose a date that isn't in the future." };
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
  if (error) return { error: "Couldn't save that score. Please try again." };

  revalidatePath("/dashboard");
  return { ok: true, message: "Score added." };
}

export async function deletePracticeScore(formData: FormData) {
  const user = await signedInUser();
  const id = String(formData.get("score_id") ?? "");
  const supabase = await createClient();
  await supabase.from("skill_scores").delete().eq("id", id).eq("student_id", user.id).eq("source", "self");
  revalidatePath("/dashboard");
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
  revalidatePath("/dashboard");
  revalidatePath("/account");
}

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);
  const targetRaw = String(formData.get("target_band") ?? "");
  const testDate = String(formData.get("test_date") ?? "");

  if (!fullName) return { error: "Please enter your name." };
  const target = targetRaw ? Number(targetRaw) : null;
  if (target !== null && !isBand(target)) return { error: "Choose a valid target band." };
  if (testDate && !DATE_RE.test(testDate)) return { error: "Choose a valid test date." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, target_band: target, test_date: testDate || null })
    .eq("id", user.id);
  if (error) return { error: "Couldn't save your changes. Please try again." };

  revalidatePath("/dashboard");
  revalidatePath("/account");
  return { ok: true, message: "Saved." };
}

export async function setTrainingOptIn(formData: FormData) {
  const user = await signedInUser();
  const optIn = formData.get("training_opt_in") === "on";
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ training_opt_in: optIn, training_opt_in_at: optIn ? new Date().toISOString() : null })
    .eq("id", user.id);
  revalidatePath("/account");
}

export async function deleteAllEssays(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    return { error: 'Type DELETE to confirm.' };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("essays").delete().eq("student_id", user.id);
  if (error) return { error: "Couldn't delete your essays. Please try again." };
  revalidatePath("/dashboard");
  revalidatePath("/writing/history");
  return { ok: true, message: "All your essays and their scores have been deleted." };
}

/** Permanently deletes the account and everything tied to it. */
export async function deleteAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await signedInUser();
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "DELETE") {
    return { error: 'Type DELETE to confirm.' };
  }
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (err) {
    console.error("Account deletion failed:", err);
    return { error: "Couldn't delete your account just now. Please email us and we'll do it for you." };
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/?account=deleted");
}
