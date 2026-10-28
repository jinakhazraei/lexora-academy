-- Lexora Academy — the student's language (hy, ru or en).
--
-- Set from the site language at sign-up and updated whenever the student
-- asks for writing feedback, so emails to the student go out in the
-- language they use the site in. Safe to run on a live database: it only
-- adds a nullable column and replaces the sign-up trigger function.

alter table public.profiles
  add column if not exists locale text
  check (locale in ('hy', 'ru', 'en'));

-- Same as 0001, plus the language from sign-up metadata.
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
  lang text := meta ->> 'locale';
begin
  insert into public.profiles (
    id, email, full_name, target_band, privacy_accepted_at, privacy_version, training_opt_in, training_opt_in_at, locale
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
    case when opted_in then now() end,
    case when lang in ('hy', 'ru', 'en') then lang end
  );
  return new;
end;
$$;
