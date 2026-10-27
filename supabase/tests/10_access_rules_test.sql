-- Access-rule tests for 0001_student_accounts.sql. Run with supabase/tests/run.sh.
-- Each DO block asserts that a forbidden action fails; the script stops on the first surprise.
\set ON_ERROR_STOP 1
\set VERBOSITY terse

-- Users: a student who accepted the policy, a Google user who hasn't, another student, a teacher.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'ani@example.com',
   '{"full_name":"Ani K","privacy_accepted":"true","privacy_version":"2026-10-27","training_opt_in":"true","role":"admin","target_band":"7.0"}'),
  ('00000000-0000-0000-0000-00000000000b', 'davit@example.com', '{"name":"Davit M"}'),
  ('00000000-0000-0000-0000-00000000000c', 'lilit@example.com', '{"full_name":"Lilit S","privacy_accepted":"true","target_band":"9.5"}'),
  ('00000000-0000-0000-0000-0000000000ee', 'teacher@example.com', '{"full_name":"Ms Teacher","privacy_accepted":"true"}');

-- Promote the teacher the way the README says (SQL editor, no JWT).
update public.profiles set role = 'teacher' where email = 'teacher@example.com';

select 'profile from signup' as test, full_name, role, privacy_accepted_at is not null as consented,
       privacy_version, training_opt_in, target_band
  from public.profiles order by email;

-- Server (secret key) writes an essay + AI score for Ani and Lilit.
set role service_role;
insert into public.essays (id, student_id, prompt_text, body, word_count, overall_band, task_response,
  coherence_cohesion, lexical_resource, grammar_accuracy, scorer)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'P', 'B', 260, 6.5, 7, 6, 7, 6, 'claude'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-00000000000c', 'P', 'B', 255, 6.0, 6, 6, 6, 6, 'claude');
insert into public.skill_scores (student_id, skill, band, source, essay_id)
values ('00000000-0000-0000-0000-00000000000a', 'writing', 6.5, 'ai', '10000000-0000-0000-0000-000000000001');
reset role;

-- ── As Ani (student) ──
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';

select 'ani sees essays' as test, count(*) from public.essays;               -- expect 1
select 'ani sees profiles' as test, count(*) from public.profiles;           -- expect 1
select 'ani sees scores' as test, count(*) from public.skill_scores;         -- expect 1

insert into public.skill_scores (student_id, skill, band, source, label, recorded_by)
values ('00000000-0000-0000-0000-00000000000a', 'listening', 7.0, 'self', 'Cambridge 18 T1',
        '00000000-0000-0000-0000-00000000000a');
select 'ani logged practice score' as test, count(*) from public.skill_scores where source = 'self';

update public.profiles set target_band = 7.5, full_name = 'Ani Karapetyan' where id = auth.uid();
select 'ani updated own profile' as test, target_band, full_name from public.profiles;

-- Each of these must FAIL. Wrap in DO blocks so we can assert the failure.
do $$ begin
  insert into public.skill_scores (student_id, skill, band, source, recorded_by)
  values ('00000000-0000-0000-0000-00000000000a', 'speaking', 9.0, 'teacher', '00000000-0000-0000-0000-00000000000a');
  raise exception 'FAIL: student forged a teacher score';
exception when insufficient_privilege then raise notice 'ok: cannot forge teacher score';
end $$;

do $$ begin
  insert into public.skill_scores (student_id, skill, band, source, recorded_by)
  values ('00000000-0000-0000-0000-00000000000c', 'reading', 4.0, 'self', '00000000-0000-0000-0000-00000000000a');
  raise exception 'FAIL: student wrote a score for someone else';
exception when insufficient_privilege then raise notice 'ok: cannot write score for another student';
end $$;

do $$ begin
  insert into public.essays (student_id, prompt_text, body, word_count, overall_band, task_response,
    coherence_cohesion, lexical_resource, grammar_accuracy, scorer)
  values ('00000000-0000-0000-0000-00000000000a', 'P', 'B', 300, 9, 9, 9, 9, 9, 'fake');
  raise exception 'FAIL: student inserted an essay with fake AI scores';
exception when insufficient_privilege then raise notice 'ok: cannot insert essays directly';
end $$;

do $$ declare n int; begin
  update public.essays set overall_band = 9 where student_id = auth.uid();
  get diagnostics n = row_count;
  if n > 0 then raise exception 'FAIL: student edited their AI band'; end if;
  raise notice 'ok: cannot edit essay scores (0 rows)';
end $$;

do $$ begin
  update public.profiles set role = 'teacher' where id = auth.uid();
  raise exception 'FAIL: student promoted themselves';
exception when insufficient_privilege then raise notice 'ok: cannot change own role';
end $$;

do $$ begin
  insert into public.teacher_reviews (essay_id, teacher_id, comment)
  values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a', 'great');
  raise exception 'FAIL: student wrote a teacher review';
exception when insufficient_privilege then raise notice 'ok: cannot write teacher reviews';
end $$;

do $$ begin
  insert into public.skill_scores (student_id, skill, band, source, recorded_by)
  values ('00000000-0000-0000-0000-00000000000a', 'reading', 6.3, 'self', '00000000-0000-0000-0000-00000000000a');
  raise exception 'FAIL: accepted a non-half band';
exception when check_violation then raise notice 'ok: band must be a half-band step';
end $$;

reset role;

-- ── As the teacher ──
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-0000000000ee';

select 'teacher sees essays' as test, count(*) from public.essays;           -- expect 2
select 'teacher sees profiles' as test, count(*) from public.profiles;       -- expect 4

insert into public.teacher_reviews (essay_id, teacher_id, comment, overall_band)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-0000000000ee',
        'Good structure — work on article use.', 6.0);
insert into public.skill_scores (student_id, skill, band, source, label, recorded_by)
values ('00000000-0000-0000-0000-00000000000a', 'speaking', 6.5, 'teacher', 'Mock speaking',
        '00000000-0000-0000-0000-0000000000ee');

do $$ begin
  update public.profiles set role = 'admin' where id = auth.uid();
  raise exception 'FAIL: teacher made themselves admin';
exception when insufficient_privilege then raise notice 'ok: teacher cannot self-promote';
end $$;

reset role;

select 'review has teacher name' as test, teacher_name from public.teacher_reviews;
select 'review marked essay reviewed' as test, review_status
  from public.essays where id = '10000000-0000-0000-0000-000000000001';      -- reviewed
select 'teacher band became a writing score' as test, skill, band, source
  from public.skill_scores where source = 'teacher' order by skill;

-- ── As Lilit: sees none of Ani's things ──
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000c';
select 'lilit sees essays' as test, count(*) from public.essays;             -- expect 1
select 'lilit sees reviews' as test, count(*) from public.teacher_reviews;   -- expect 0
select 'lilit sees scores' as test, count(*) from public.skill_scores;       -- expect 0

-- ── Ani deletes her essay: AI and teacher scores tied to it go too ──
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
delete from public.essays where id = '10000000-0000-0000-0000-000000000001';
select 'after delete, ani scores' as test, skill, source from public.skill_scores order by skill;

-- ── Anonymous visitor ──
reset role;
set role anon;
do $$ begin
  perform 1 from public.profiles;
  raise exception 'FAIL: anon can read profiles';
exception when insufficient_privilege then raise notice 'ok: anon has no table access';
end $$;
reset role;

select 'ALL CHECKS PASSED' as result;
