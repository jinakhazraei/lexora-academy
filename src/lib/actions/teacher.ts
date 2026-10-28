"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fmt, langFrom } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { sendNotification, siteUrl } from "@/lib/email";
import { SKILLS, isBand } from "@/lib/ielts";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Skill } from "@/lib/types";

export type TeacherActionState = { ok?: boolean; error?: string; message?: string } | undefined;

async function staffUser() {
  const user = await getCurrentUser();
  if (!user?.profile || !isStaff(user.profile)) redirect("/login");
  return { ...user, profile: user.profile };
}

export async function submitReview(_prev: TeacherActionState, formData: FormData): Promise<TeacherActionState> {
  const teacher = await staffUser();
  const essayId = String(formData.get("essay_id") ?? "");
  const comment = String(formData.get("comment") ?? "").trim().slice(0, 5000);
  const bandRaw = String(formData.get("overall_band") ?? "");
  const band = bandRaw ? Number(bandRaw) : null;

  if (!comment) return { error: "Write a comment for the student." };
  if (band !== null && !isBand(band)) return { error: "Choose a valid band." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("teacher_reviews")
    .insert({ essay_id: essayId, teacher_id: teacher.id, comment, overall_band: band });
  if (error) return { error: "Couldn't save the review. Please try again." };

  // Let the student know (best effort), in the language they use the site in.
  // profiles(*) rather than named columns, so this keeps working before migration 0002 adds `locale`.
  const { data: essay } = await supabase.from("essays").select("student:profiles(*)").eq("id", essayId).maybeSingle();
  const student = (essay as { student?: { email: string | null; full_name: string; locale?: string | null } | null } | null)
    ?.student;
  if (student?.email) {
    const lang = langFrom(student.locale);
    const e = getDictionary(lang).emails;
    const name = student.full_name?.trim().split(/\s+/)[0];
    const teacherName = teacher.profile.full_name?.trim();
    await sendNotification(
      student.email,
      e.reviewSubject,
      [
        name ? fmt(e.hiName, { name }) : e.hi,
        "",
        teacherName ? fmt(e.reviewBody, { teacher: teacherName }) : e.reviewBodyNoName,
        fmt(e.reviewLink, { url: `${siteUrl()}/${lang}/writing/history/${essayId}` }),
        "",
        e.signoff,
      ].join("\n"),
    );
  }

  revalidatePath("/[lang]/teacher", "page");
  revalidatePath("/[lang]/teacher/essays/[id]", "page");
  return { ok: true, message: "Review sent to the student." };
}

export async function recordTeacherScore(_prev: TeacherActionState, formData: FormData): Promise<TeacherActionState> {
  const teacher = await staffUser();
  const studentId = String(formData.get("student_id") ?? "");
  const skill = String(formData.get("skill") ?? "") as Skill;
  const band = Number(formData.get("band"));
  const label = String(formData.get("label") ?? "").trim().slice(0, 120);
  const takenOn = String(formData.get("taken_on") ?? "");

  if (!SKILLS.some((s) => s.key === skill)) return { error: "Choose a skill." };
  if (!isBand(band)) return { error: "Choose a valid band." };
  if (takenOn && !/^\d{4}-\d{2}-\d{2}$/.test(takenOn)) return { error: "Choose a valid date." };

  const supabase = await createClient();
  const { error } = await supabase.from("skill_scores").insert({
    student_id: studentId,
    skill,
    band,
    source: "teacher",
    label: label || null,
    taken_on: takenOn || undefined,
    recorded_by: teacher.id,
  });
  if (error) return { error: "Couldn't save the score. Please try again." };

  revalidatePath("/[lang]/teacher/students/[id]", "page");
  revalidatePath("/[lang]/teacher", "page");
  return { ok: true, message: "Score recorded." };
}

/** A teacher takes a student on (or lets them go). Uses the secret key because students can't set this. */
export async function setAssignment(formData: FormData) {
  const teacher = await staffUser();
  const studentId = String(formData.get("student_id") ?? "");
  const assign = formData.get("assign") === "1";
  const admin = createAdminClient();
  const { data: student } = await admin.from("profiles").select("id, role, teacher_id").eq("id", studentId).maybeSingle();
  if (!student || student.role !== "student") return;
  // A teacher can release only their own student; an admin can release anyone.
  if (!assign && student.teacher_id !== teacher.id && teacher.profile.role !== "admin") return;

  await admin.from("profiles").update({ teacher_id: assign ? teacher.id : null }).eq("id", studentId);
  revalidatePath("/[lang]/teacher", "page");
  revalidatePath("/[lang]/teacher/students/[id]", "page");
}
