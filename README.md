# Lexora Academy

Website and student platform for [Lexora Academy](https://www.lexora-academy-institute.online), an English
language school in Yerevan specialising in IELTS preparation.

Alongside the public site (courses, consultations), students get an account where they can write IELTS
Task 2 essays for AI feedback, track all four skills against a target band, and send any result to their
teacher. Teachers get a review queue and can record scores from mock tests they mark.

**Built with:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Supabase (Postgres, Auth, row-level
security) · Claude API (structured outputs) · Resend

## Features

| | |
| --- | --- |
| **Student accounts** | Email/password sign-up with a required privacy-consent checkbox and an optional model-training opt-in; optional Google sign-in; password reset. |
| **Progress dashboard** | Latest band, trend line and gap-to-target for Listening, Reading, Writing and Speaking; overall estimate; "focus next" skill; writing-criteria averages; practice-test log; full score table. |
| **Writing Feedback** (`/writing`) | Task 2 prompt picker (or your own question), live word counter with the 250-word target, drafts saved on the device, and a results panel: overall band, four criteria bars with notes, grammar flags quoting the student's own words, summary and next steps. |
| **Essay history** | Every essay with its feedback, highlighted corrections and teacher reviews; delete any essay. |
| **Teacher area** (`/teacher`) | Review queue from "Send to my teacher", review form with optional teacher band, student list with latest bands, assign students, record teacher-assessed scores. |
| **Trust & transparency** | [How our AI works](https://www.lexora-academy-institute.online/how-our-ai-works), a plain-English Privacy Policy, "Estimated band, not an official IELTS score." on every score, data download and account deletion. |

## How the pieces fit

```
Browser ──► Next.js pages & server actions ──► Supabase (as the signed-in user, RLS applies)
                     │
                     └─► /api/writing/score ──► EssayScorer (Claude, or Lexora's own model)
                                   │
                                   └─► saves essay + AI score with the secret key
```

- **Row-level security** decides who sees what: students see only their own rows; teachers and admins see
  everyone. Essays and AI scores are written only by the server, so students can't fake a score.
- **The scorer is swappable** — see [docs/WRITING_SCORER.md](docs/WRITING_SCORER.md). The overall band is always
  computed by the site, and grammar flags that don't quote the essay are discarded.
- **Consent is versioned** — nothing is stored until a student accepts the current Privacy Policy version.

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in the keys — see docs/SETUP.md
npm run dev
```

Open <http://localhost:3000>. Without Supabase keys, the public site works and account pages show a
"being set up" notice.

## Setup and docs

- [docs/SETUP.md](docs/SETUP.md) — Supabase project, Vercel variables, making teachers and admins
- [docs/WRITING_SCORER.md](docs/WRITING_SCORER.md) — the scoring interface and how to plug in your own model
- [supabase/migrations](supabase/migrations) — the database schema and access rules

## Tests

The database access rules have their own test, run against any throwaway local Postgres:

```bash
createdb lexora_test
./supabase/tests/run.sh lexora_test
```

It checks, among other things, that students can't read each other's work, forge AI or teacher scores, or
promote themselves, and that teachers can review essays but can't make themselves admin.
