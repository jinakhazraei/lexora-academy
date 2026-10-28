# Setting up student accounts and Writing Feedback

Until these steps are done, the marketing site works exactly as before, and the new pages show a friendly
"being set up" message instead of breaking.

You need about 30 minutes, a Supabase account (free tier is fine) and an Anthropic API key.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a region close to your students — **Central EU (Frankfurt)** is the closest to Yerevan.
3. Save the database password somewhere safe (you won't need it for the website).

## 2. Create the tables

1. In the project, open **SQL Editor → New query**.
2. Paste the whole of [`supabase/migrations/0001_student_accounts.sql`](../supabase/migrations/0001_student_accounts.sql).
3. Press **Run**. You should see "Success. No rows returned".

This creates the profiles, essays, teacher reviews and skill scores tables, plus the row-level security rules
that keep each student's work private.

## 3. Point Supabase Auth at the website

**Authentication → URL Configuration**

- **Site URL:** `https://www.lexora-academy-institute.online`
- **Redirect URLs:** add
  - `https://www.lexora-academy-institute.online/auth/callback`
  - `http://localhost:3000/auth/callback` (for local development)

**Authentication → Emails → SMTP Settings** (recommended before real students sign up)

Supabase's built-in email sender only allows a few emails per hour. Since you already use Resend, turn on
custom SMTP with Resend's SMTP details (host `smtp.resend.com`, port `465`, user `resend`, password = a Resend
API key) and a sender on your verified domain.

## 4. Get an Anthropic API key

1. [console.anthropic.com](https://console.anthropic.com) → **API Keys → Create key**.
2. Set a monthly spend limit under **Billing / Limits**.

Each essay costs roughly 1–2 US cents with the default model (about 2,000 input and 1,000 output tokens).
`WRITING_DAILY_LIMIT` (default 10 essays per student per day) keeps costs predictable.

## 5. Add the keys to Vercel

**Vercel → your project → Settings → Environment Variables** (Production and Preview).

This is free on every Vercel plan. Don't use the separate **Environments** page: its **Create Environment**
button makes extra custom environments (like `staging`), a paid Pro feature you don't need — Production and
Preview already exist. Choose the **Secret** type for `SUPABASE_SECRET_KEY` and `ANTHROPIC_API_KEY`.

| Name | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Connect** button (top of the project) → Project URL, e.g. `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → **Publishable** key (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Same page → **Secret** key (`sb_secret_…`; create one if none is listed). Keep private. |
| `ANTHROPIC_API_KEY` | Step 4 |
| `NEXT_PUBLIC_SITE_URL` | `https://www.lexora-academy-institute.online` |
| `WRITING_DAILY_LIMIT` | Optional, default `10` |

Keep the existing `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.

Then **redeploy** — variables starting with `NEXT_PUBLIC_` are only picked up by a new build.

### Try it on a preview first (before merging)

Vercel builds a preview of every pull request, at a fixed branch address shown on the pull request
(`lexora-academy-git-…-lexora6.vercel.app`). To test accounts and scoring there without touching the live site:

1. Add the variables above with only the **Preview** box ticked. Add them for **Production** later, when you merge.
2. In Supabase **Authentication → URL Configuration → Redirect URLs**, also add
   `https://*-lexora6.vercel.app/**` so sign-up and password links can return to previews.
3. In Vercel **Deployments**, open the latest preview → **⋯ → Redeploy**, so it picks up the new variables.
4. Open the preview, sign up as a student, write an essay, then sign up a second account, make it a teacher
   (step 6 below) and review the essay.

Previews automatically use their own address for email links, even if `NEXT_PUBLIC_SITE_URL` is set. Test
accounts live in the same Supabase project, so delete them afterwards from **Authentication → Users**.

## 6. Make yourself admin, and add teachers

1. Sign up on the website with your own email (`/signup`).
2. In Supabase **SQL Editor**, run:

```sql
-- You: full access, can manage roles.
update public.profiles set role = 'admin' where email = 'you@example.com';

-- Each teacher, after they've signed up on the website:
update public.profiles set role = 'teacher' where email = 'teacher@example.com';
```

Teachers and admins land on `/teacher` instead of the student dashboard. Students can never change their own
role — the database refuses.

## 7. Optional: "Continue with Google"

1. Google Cloud Console → create an OAuth client (Web), with the redirect URI Supabase shows on
   **Authentication → Sign In / Providers → Google**.
2. Paste the client ID and secret into Supabase and enable the provider.
3. Set `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true` in Vercel and redeploy.

Students who sign up with Google are asked to accept the Privacy Policy the first time they open their
dashboard or submit an essay. Nothing is saved before that.

## Checking it works

1. Sign up as a test student, write an essay on `/writing`, press **Get feedback**.
2. Press **Send to my teacher**, then log in as a teacher and review it on `/teacher`.
3. Back as the student, the review appears on the essay and the dashboard.

## Troubleshooting

**"You're signed in, but your student profile couldn't be found"** — the account was created before the
database setup in step 2 ran (or step 2 failed). Run step 2, then this once in the SQL Editor to create the
missing profiles:

```sql
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;
```

Those students will be asked to accept the Privacy Policy the next time they open their dashboard.

**The confirmation email link opens the live site, or `localhost`** — the address isn't in Supabase's
Redirect URLs (step 3), so Supabase fell back to the Site URL. Add it, then sign up again.

## Before launch

- Read the [Privacy Policy](../src/app/privacy/page.tsx) carefully. It's written in plain English but is not
  legal advice — have it checked for Armenian data-protection law, and update the list of providers if you
  don't host on Vercel.
- If you change the policy in a way students should re-accept, bump `PRIVACY_VERSION` in `src/lib/ielts.ts`.
