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

**Vercel → your project → Settings → Environment Variables** (Production and Preview):

| Name | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API Keys → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → API Keys → **Publishable** key (`sb_publishable_…`) |
| `SUPABASE_SECRET_KEY` | Supabase → API Keys → **Secret** key (`sb_secret_…`). Keep private. |
| `ANTHROPIC_API_KEY` | Step 4 |
| `NEXT_PUBLIC_SITE_URL` | `https://www.lexora-academy-institute.online` |
| `WRITING_DAILY_LIMIT` | Optional, default `10` |

Keep the existing `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.

Then **redeploy** — variables starting with `NEXT_PUBLIC_` are only picked up by a new build.

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

## Before launch

- Read the [Privacy Policy](../src/app/privacy/page.tsx) carefully. It's written in plain English but is not
  legal advice — have it checked for Armenian data-protection law, and update the list of providers if you
  don't host on Vercel.
- If you change the policy in a way students should re-accept, bump `PRIVACY_VERSION` in `src/lib/ielts.ts`.
