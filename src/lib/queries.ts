import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { EssayRow, Profile, SkillScoreRow, TeacherReviewRow } from "@/lib/types";

// All reads use the signed-in user's session, so row-level security decides what comes back.

export type EssaySummary = Pick<
  EssayRow,
  "id" | "prompt_text" | "word_count" | "overall_band" | "review_status" | "created_at" | "student_id"
>;

const SUMMARY_COLUMNS = "id, prompt_text, word_count, overall_band, review_status, created_at, student_id";

export async function listEssays(studentId: string, limit = 50): Promise<EssaySummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("essays")
    .select(SUMMARY_COLUMNS)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as EssaySummary[];
}

export async function getEssay(id: string) {
  const supabase = await createClient();
  const [{ data: essay }, { data: reviews }] = await Promise.all([
    supabase.from("essays").select("*").eq("id", id).maybeSingle(),
    supabase.from("teacher_reviews").select("*").eq("essay_id", id).order("created_at", { ascending: false }),
  ]);
  if (!essay) return null;
  return { essay: essay as EssayRow, reviews: (reviews ?? []) as TeacherReviewRow[] };
}

export async function listSkillScores(studentId: string): Promise<SkillScoreRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("skill_scores")
    .select("*")
    .eq("student_id", studentId)
    .order("taken_on", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as SkillScoreRow[];
}

export async function listRecentReviewsForStudent(studentId: string, limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("teacher_reviews")
    .select("id, essay_id, teacher_name, comment, overall_band, created_at, essays!inner(student_id, prompt_text)")
    .eq("essays.student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as (TeacherReviewRow & { essays: { student_id: string; prompt_text: string } })[];
}

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Profile | null) ?? null;
}
