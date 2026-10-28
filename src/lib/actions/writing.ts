"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { langFrom } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/auth";
import { sendNotification, siteUrl } from "@/lib/email";
import { formatBand } from "@/lib/ielts";
import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ReviewRequestState = { ok?: boolean; error?: keyof Dictionary["results"]["sendErrors"] } | undefined;

/** "Send to my teacher": puts the essay in the teacher review queue and emails the teacher. */
export async function requestTeacherReview(_prev: ReviewRequestState, formData: FormData): Promise<ReviewRequestState> {
  const user = await getCurrentUser();
  if (!user?.profile) return { error: "login" };

  const essayId = String(formData.get("essay_id") ?? "");
  const note = String(formData.get("note") ?? "").trim().slice(0, 1000);

  const supabase = await createClient();
  const { data: essay } = await supabase
    .from("essays")
    .select("id, student_id, review_status, overall_band, prompt_text")
    .eq("id", essayId)
    .maybeSingle();
  if (!essay || essay.student_id !== user.id) return { error: "notFound" };
  if (essay.review_status === "requested") return { ok: true };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "notConfigured" };
  }
  const { error } = await admin
    .from("essays")
    .update({ review_status: "requested", review_note: note || null, review_requested_at: new Date().toISOString() })
    .eq("id", essayId)
    .eq("student_id", user.id);
  if (error) return { error: "failed" };

  // Email the student's own teacher if one is assigned, otherwise the institute inbox.
  // Teacher emails are always in English, like the teacher area.
  let to = process.env.CONTACT_TO_EMAIL ?? "";
  if (user.profile.teacher_id) {
    const { data: teacher } = await admin.from("profiles").select("email").eq("id", user.profile.teacher_id).maybeSingle();
    if (teacher?.email) to = teacher.email;
  }
  const studentName = user.profile.full_name || user.email || "A student";
  await sendNotification(
    to,
    `Essay review request from ${studentName}`,
    [
      `${studentName} asked for a teacher review of a Writing Task 2 essay.`,
      `AI estimate: band ${formatBand(essay.overall_band)}`,
      "",
      `Prompt: ${essay.prompt_text}`,
      note ? `\nStudent's note: ${note}` : "",
      "",
      `Review it here: ${siteUrl()}/en/teacher/essays/${essay.id}`,
    ].join("\n"),
  );

  revalidatePath("/[lang]/writing/history/[id]", "page");
  revalidatePath("/[lang]/dashboard", "page");
  return { ok: true };
}

/** Students can delete any of their own essays (and the scores tied to them). */
export async function deleteEssay(formData: FormData) {
  const lang = langFrom(formData.get("lang"));
  const user = await getCurrentUser();
  if (!user) redirect(`/${lang}/login`);
  const essayId = String(formData.get("essay_id") ?? "");
  const supabase = await createClient();
  await supabase.from("essays").delete().eq("id", essayId).eq("student_id", user.id);
  revalidatePath("/[lang]/dashboard", "page");
  revalidatePath("/[lang]/writing/history", "page");
  redirect(`/${lang}/writing/history?deleted=1`);
}
