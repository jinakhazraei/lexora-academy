export type UserRole = "student" | "teacher" | "admin";
export type Skill = "listening" | "reading" | "writing" | "speaking";
export type ScoreSource = "self" | "teacher" | "ai";
export type ReviewStatus = "none" | "requested" | "reviewed";

export type CriterionKey = "taskResponse" | "coherenceCohesion" | "lexicalResource" | "grammarAccuracy";

export type GrammarFlagCategory = "grammar" | "punctuation" | "spelling" | "word choice" | "cohesion";

export type GrammarFlag = {
  excerpt: string;
  issue: string;
  suggestion: string;
  category: GrammarFlagCategory;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  target_band: number | null;
  test_date: string | null;
  teacher_id: string | null;
  privacy_accepted_at: string | null;
  privacy_version: string | null;
  training_opt_in: boolean;
  training_opt_in_at: string | null;
  created_at: string;
};

export type EssayRow = {
  id: string;
  student_id: string;
  task_type: "task2";
  prompt_id: string | null;
  prompt_text: string;
  body: string;
  word_count: number;
  overall_band: number;
  task_response: number;
  coherence_cohesion: number;
  lexical_resource: number;
  grammar_accuracy: number;
  criteria_notes: Partial<Record<CriterionKey, string>>;
  grammar_flags: GrammarFlag[];
  summary: string;
  next_steps: string[];
  scorer: string;
  review_status: ReviewStatus;
  review_note: string | null;
  review_requested_at: string | null;
  created_at: string;
};

export type TeacherReviewRow = {
  id: string;
  essay_id: string;
  teacher_id: string | null;
  teacher_name: string | null;
  comment: string;
  overall_band: number | null;
  created_at: string;
};

export type SkillScoreRow = {
  id: string;
  student_id: string;
  skill: Skill;
  band: number;
  source: ScoreSource;
  label: string | null;
  taken_on: string;
  essay_id: string | null;
  recorded_by: string | null;
  created_at: string;
};
