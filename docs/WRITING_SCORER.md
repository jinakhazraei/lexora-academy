# Writing Feedback scorer

The essay scorer sits behind one small interface (`src/lib/scoring/types.ts`), so the engine can change
without touching the page, the database or the dashboard.

```ts
interface EssayScorer {
  name: string;
  score(input: { prompt: string; essay: string; wordCount: number }): Promise<EssayScore>;
}
```

| `ESSAY_SCORER` | Engine | File |
| --- | --- | --- |
| `claude` (default) | Claude via the Anthropic API, with structured JSON output | `src/lib/scoring/claude.ts` |
| `http` | Lexora's own model, called over HTTP | `src/lib/scoring/http.ts` |

## How a score is made safe

Whatever the engine returns goes through `normalizeScore()` in `src/lib/scoring/schema.ts`:

- each criterion becomes a whole band from 0 to 9 (rounded and clamped);
- the **overall band is always computed by the website** — the average of the four criteria, rounded down to
  the nearest half band — never trusted from the model;
- a grammar flag is kept only if its `excerpt` really appears in the essay (case-insensitive), so invented
  quotes never reach students; duplicates are dropped and at most 8 are kept;
- text fields are trimmed and length-limited.

Every saved essay records which engine scored it in `essays.scorer` (e.g. `claude:claude-sonnet-5-5` or
`lexora:v0.3`), so you can compare engines later.

## Plugging in your own model

Set `ESSAY_SCORER=http`, `ESSAY_SCORER_URL=https://your-model.example.com/score` and, optionally,
`ESSAY_SCORER_TOKEN` (sent as `Authorization: Bearer <token>`).

The site sends:

```http
POST /score
Content-Type: application/json

{ "prompt": "Some people think…", "essay": "Nowadays more and more…", "word_count": 273 }
```

Your endpoint returns (within 55 seconds):

```json
{
  "model_version": "v0.3",
  "task_response":      { "band": 7, "note": "You answer both parts…" },
  "coherence_cohesion": { "band": 6, "note": "Your paragraphs are logical…" },
  "lexical_resource":   { "band": 7, "note": "Good topic vocabulary…" },
  "grammar_accuracy":   { "band": 6, "note": "A good mix of complex sentences…" },
  "grammar_flags": [
    {
      "excerpt": "informations",
      "issue": "“Information” is uncountable.",
      "suggestion": "information",
      "category": "grammar"
    }
  ],
  "summary": "A clear, well-organised essay…",
  "next_steps": ["Add one concrete example to each body paragraph."]
}
```

`category` is one of `grammar`, `punctuation`, `spelling`, `word choice`, `cohesion`. `model_version` is
optional and is stored with the essay.

## Training data

Students choose separately whether their essays may be used to train Lexora's model
(`profiles.training_opt_in`). To export only consented essays, without names or emails:

```sql
select e.id, e.prompt_text, e.body, e.word_count,
       e.task_response, e.coherence_cohesion, e.lexical_resource, e.grammar_accuracy,
       r.overall_band as teacher_band
from public.essays e
join public.profiles p on p.id = e.student_id
left join lateral (
  select overall_band from public.teacher_reviews
  where essay_id = e.id and overall_band is not null
  order by created_at desc limit 1
) r on true
where p.training_opt_in;
```

Teacher-reviewed bands (`teacher_band`) are the most valuable labels for training. Check essay text for
personal details before using it.
