-- Lexora Academy — student accounts, essays, scores and teacher reviews.
--
-- Run this once in the Supabase dashboard (SQL Editor → New query → paste → Run),
-- or with the Supabase CLI: `supabase db push`.
--
-- Access model
--   * Students see and manage only their own data.
--   * Teachers and admins (profiles.role) can see every student, review essays
--     and record teacher-assessed scores.
--   * Essays and AI scores are written only by the website's server (secret key),
--     so a student cannot invent an "AI" or "teacher" score for themselves.
--   * Roles are changed only by an admin or from the Supabase dashboard.

-- ─── Types ──────────────────────────────────────────────────────────────────

create type public.user_role as enum ('student', 'teacher', 'admin');
create type public.ielts_skill as enum ('listening', 'reading', 'writing', 'speaking');
create type public.score_source as enum ('self', 'teacher', 'ai');
create type public.review_status as enum ('none', 'requested', 'reviewed');

-- An IELTS band: 0–9 in half-band steps.
create domain public.band as numeric(2, 1)
  check (value >= 0 and value <= 9 and value * 2 = trunc(value * 2));

-- ─── Tables ─────────────────────────────────────────────────────────────────

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text not null default '',
  role public.user_role not null default 'student',
  target_band public.band,
  test_date date,
  teacher_id uuid references public.profiles (id) on delete set null,
  -- Consent to store essays and scores. Nothing is saved until this is set.
  privacy_accepted_at timestamptz,
  privacy_version text,
  -- Separate, optional consent to use anonymised essays to improve our scoring model.
  training_opt_in boolean not null default false,
  training_opt_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.essays (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  task_type text not null default 'task2' check (task_type in ('task2')),
  prompt_id text,
  prompt_text text not null,
  body text not null,
  word_count integer not null check (word_count >= 0),
  overall_band public.band not null,
  task_response public.band not null,
  coherence_cohesion public.band not null,
  lexical_resource public.band not null,
  grammar_accuracy public.band not null,
  criteria_notes jsonb not null default '{}'::jsonb,
  grammar_flags jsonb not null default '[]'::jsonb,
  summary text not null default '',
  next_steps jsonb not null default '[]'::jsonb,
  scorer text not null,
  review_status public.review_status not null default 'none',
  review_note text,
  review_requested_at timestamptz,
  created_at timestamptz not null default now()
);

create index essays_student_created_idx on public.essays (student_id, created_at desc);
create index essays_review_queue_idx on public.essays (review_status, review_requested_at)
  where review_status = 'requested';

create table public.teacher_reviews (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid not null references public.essays (id) on delete cascade,
  teacher_id uuid references public.profiles (id) on delete set null,
  -- Copied from the teacher's profile so students can see who reviewed (they can't read staff profiles).
  teacher_name text,
  comment text not null check (length(trim(comment)) > 0),
  overall_band public.band,
  created_at timestamptz not null default now()
);

create index teacher_reviews_essay_idx on public.teacher_reviews (essay_id, created_at desc);

create table public.skill_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  skill public.ielts_skill not null,
  band public.band not null,
  source public.score_source not null,
  label text,
  taken_on date not null default current_date,
  essay_id uuid references public.essays (id) on delete cascade,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index skill_scores_student_idx on public.skill_scores (student_id, skill, taken_on desc, created_at desc);

-- ─── Helpers ────────────────────────────────────────────────────────────────

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Create a profile for every new sign-up. Only the name and the consent
-- choices are read from sign-up metadata — never the role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  accepted boolean := coalesce(meta ->> 'privacy_accepted', '') = 'true';
  opted_in boolean := accepted and coalesce(meta ->> 'training_opt_in', '') = 'true';
  target text := meta ->> 'target_band';
begin
  insert into public.profiles (
    id, email, full_name, target_band, privacy_accepted_at, privacy_version, training_opt_in, training_opt_in_at
  ) values (
    new.id,
    new.email,
    left(coalesce(meta ->> 'full_name', meta ->> 'name', ''), 120),
    case when target ~ '^[1-9](\.[05])?$' then
      case when target::numeric <= 9 then target::numeric end
    end,
    case when accepted then now() end,
    case when accepted then left(meta ->> 'privacy_version', 20) end,
    opted_in,
    case when opted_in then now() end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Students may edit their own profile, but not their role or assigned teacher.
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if new.role is distinct from old.role
       or new.teacher_id is distinct from old.teacher_id
       or new.email is distinct from old.email
       or new.id is distinct from old.id then
      raise exception 'Only an admin can change role, teacher or email.'
        using errcode = '42501';
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

create or replace function public.set_review_teacher_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select nullif(full_name, '') into new.teacher_name from public.profiles where id = new.teacher_id;
  return new;
end;
$$;

create trigger teacher_reviews_before_insert
  before insert on public.teacher_reviews
  for each row execute function public.set_review_teacher_name();

-- When a teacher reviews an essay, mark it reviewed and, if they gave a band,
-- record it as a teacher-assessed writing score.
create or replace function public.handle_teacher_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  essay_student uuid;
begin
  update public.essays
     set review_status = 'reviewed'
   where id = new.essay_id
   returning student_id into essay_student;

  if new.overall_band is not null then
    insert into public.skill_scores (student_id, skill, band, source, label, essay_id, recorded_by)
    values (essay_student, 'writing', new.overall_band, 'teacher', 'Teacher-reviewed essay', new.essay_id, new.teacher_id);
  end if;
  return new;
end;
$$;

create trigger teacher_reviews_after_insert
  after insert on public.teacher_reviews
  for each row execute function public.handle_teacher_review();

-- ─── Row-level security ─────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.essays enable row level security;
alter table public.teacher_reviews enable row level security;
alter table public.skill_scores enable row level security;

-- profiles
create policy "profiles: read own, staff read all"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_staff()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles: admin updates any"
  on public.profiles for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- essays (inserts and AI updates happen on the server with the secret key)
create policy "essays: read own, staff read all"
  on public.essays for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_staff()));

create policy "essays: delete own"
  on public.essays for delete to authenticated
  using (student_id = (select auth.uid()));

-- teacher_reviews
create policy "reviews: student reads reviews of own essays, staff read all"
  on public.teacher_reviews for select to authenticated
  using (
    (select public.is_staff())
    or exists (
      select 1 from public.essays e
      where e.id = essay_id and e.student_id = (select auth.uid())
    )
  );

create policy "reviews: staff create as themselves"
  on public.teacher_reviews for insert to authenticated
  with check ((select public.is_staff()) and teacher_id = (select auth.uid()));

create policy "reviews: author edits own"
  on public.teacher_reviews for update to authenticated
  using (teacher_id = (select auth.uid()))
  with check (teacher_id = (select auth.uid()));

create policy "reviews: author deletes own"
  on public.teacher_reviews for delete to authenticated
  using (teacher_id = (select auth.uid()));

-- skill_scores
create policy "scores: read own, staff read all"
  on public.skill_scores for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_staff()));

create policy "scores: student logs own practice scores"
  on public.skill_scores for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and source = 'self'
    and recorded_by = (select auth.uid())
    and essay_id is null
  );

create policy "scores: staff record teacher scores"
  on public.skill_scores for insert to authenticated
  with check (
    (select public.is_staff())
    and source = 'teacher'
    and recorded_by = (select auth.uid())
  );

create policy "scores: delete own practice scores, staff delete teacher scores"
  on public.skill_scores for delete to authenticated
  using (
    (student_id = (select auth.uid()) and source = 'self')
    or ((select public.is_staff()) and source = 'teacher')
  );

-- The browser never needs anonymous access to these tables.
revoke all on public.profiles, public.essays, public.teacher_reviews, public.skill_scores from anon;
