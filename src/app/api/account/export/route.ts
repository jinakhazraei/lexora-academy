import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/** "Download my data": everything stored about the signed-in student, as JSON. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please log in." }, { status: 401 });

  const supabase = await createClient();
  const [profile, essays, scores, reviews] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("essays").select("*").eq("student_id", user.id).order("created_at"),
    supabase.from("skill_scores").select("*").eq("student_id", user.id).order("taken_on"),
    supabase
      .from("teacher_reviews")
      .select("id, essay_id, teacher_name, comment, overall_band, created_at, essays!inner(student_id)")
      .eq("essays.student_id", user.id),
  ]);

  const body = JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      note: "All bands are estimates, not official IELTS scores.",
      profile: profile.data,
      essays: essays.data ?? [],
      skill_scores: scores.data ?? [],
      teacher_reviews: (reviews.data ?? []).map((r) => {
        const { essays, ...review } = r as typeof r & { essays: unknown };
        void essays;
        return review;
      }),
    },
    null,
    2,
  );

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lexora-my-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
