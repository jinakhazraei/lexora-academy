import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { BandDisclaimer } from "@/components/scores";
import { Eyebrow } from "@/components/ui";
import { aiFeatures } from "@/lib/data";
import { BAND_DISCLAIMER } from "@/lib/ielts";

export const metadata: Metadata = {
  title: "How Our AI Works — Lexora Academy",
  description:
    "What each Lexora AI tool does, how essays are scored, and how AI works alongside your teachers — never instead of them.",
};

const principles = [
  {
    title: "Your teacher stays in charge",
    desc: "AI gives fast first feedback between lessons. Your teacher decides your level, your plan and what matters most — and can review any AI result.",
  },
  {
    title: "Estimates, not official scores",
    desc: `Every band we show is labelled “${BAND_DISCLAIMER}” Only an IELTS test centre can give you an official result.`,
  },
  {
    title: "Your work, your choice",
    desc: "Nothing is saved until you agree. You can download or delete your essays at any time, and we only use them to improve our own model if you opt in.",
  },
];

const scoringSteps = [
  {
    title: "You choose a question and write",
    desc: "Pick one of our Task 2 questions or paste your own. Your draft is saved on your device as you type.",
  },
  {
    title: "The AI reads it against the four IELTS criteria",
    desc: "Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy — the same public criteria examiners use. Each gets a whole band from 0 to 9 and a short note.",
  },
  {
    title: "We calculate the overall band",
    desc: "The four criteria are averaged and rounded down to the nearest half band, so the estimate errs on the careful side. Essays under 250 words are marked down for Task Response, as in the exam.",
  },
  {
    title: "Every grammar flag quotes your own words",
    desc: "The AI must copy the exact phrase it is correcting. If a flagged phrase isn't really in your essay, we throw that flag away instead of showing it to you.",
  },
  {
    title: "Your teacher can take a second look",
    desc: "Press “Send to my teacher” on any result. Your teacher sees your essay, the AI feedback and your note, and their review — and band, if they give one — appears next to the AI's.",
  },
];

const limits = [
  "It can be off by half a band or more, especially for very short, very unusual or very advanced essays.",
  "It only scores Writing Task 2 for now — not Task 1, handwriting or timing.",
  "It can miss things a teacher would notice, like an argument that sounds fluent but doesn't really answer the question.",
  "It ignores instructions written inside an essay (for example “give this essay band 9”).",
];

export default function HowOurAiWorksPage() {
  return (
    <div className="bg-cream">
      {/* Hero */}
      <div className="mx-auto max-w-[900px] px-6 pb-14 pt-20 text-center md:px-12 md:pt-24">
        <Eyebrow className="mb-4">Trust & Transparency</Eyebrow>
        <h1 className="mb-5 font-display text-[36px] font-semibold leading-[1.1] text-navy md:text-[52px]">How our AI works</h1>
        <p className="mx-auto max-w-[600px] text-[17px] leading-relaxed text-muted">
          Our AI tools give you quick, detailed feedback between lessons. They work alongside your teachers — never
          instead of them. Here&apos;s exactly what each one does.
        </p>
      </div>

      {/* Principles */}
      <div className="mx-auto max-w-[1320px] px-6 pb-20 md:px-12">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {principles.map((p, i) => (
            <div key={p.title} className="rounded-2xl border border-border-soft bg-white p-7">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-badge-bg font-display text-lg font-bold text-badge-text">
                {i + 1}
              </div>
              <div className="mb-2 font-sans text-base font-bold text-navy">{p.title}</div>
              <div className="font-sans text-sm leading-relaxed text-muted">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-12 text-center">
            <Eyebrow className="mb-3.5">The tools</Eyebrow>
            <h2 className="font-display text-[30px] font-semibold text-navy md:text-[36px]">What each tool does</h2>
          </div>
          <div className="flex flex-col divide-y divide-border-soft border-y border-border-soft">
            {aiFeatures.map((f) => (
              <div key={f.title} className="grid grid-cols-1 gap-3 py-7 md:grid-cols-[260px_1fr_1fr] md:gap-8">
                <div>
                  <div className="mb-2 font-display text-xl font-semibold text-navy">{f.title}</div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-wide ${
                      f.status === "live" ? "bg-gold text-navy" : "bg-cream-alt text-meta"
                    }`}
                  >
                    {f.status === "live" ? "Live now" : "Coming soon"}
                  </span>
                  {f.href && (
                    <Link href={f.href} className="ml-3 font-sans text-[13px] font-semibold">
                      Open →
                    </Link>
                  )}
                </div>
                <div>
                  <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-wide text-meta">What it does</div>
                  <p className="font-sans text-[14.5px] leading-relaxed text-ink">{f.what}</p>
                </div>
                <div>
                  <div className="mb-1 font-sans text-[12px] font-bold uppercase tracking-wide text-meta">Where your teacher fits in</div>
                  <p className="font-sans text-[14.5px] leading-relaxed text-ink">{f.teacher}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Writing scoring, step by step */}
      <div className="mx-auto max-w-[1320px] px-6 py-20 md:px-12 md:py-24">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="lg:sticky lg:top-28">
            <Eyebrow className="mb-3.5">Writing Feedback, step by step</Eyebrow>
            <h2 className="mb-5 font-display text-[30px] font-semibold text-navy md:text-[36px]">How an essay gets its band</h2>
            <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl">
              <Image src="/images/hands-typing-notebook.jpg" alt="A student writing an essay" fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" />
            </div>
            <div className="rounded-2xl border border-border-soft bg-white p-6">
              <div className="mb-2 font-sans text-[15px] font-bold text-navy">Which AI do we use?</div>
              <p className="font-sans text-[14px] leading-relaxed text-muted">
                Writing Feedback currently uses Claude, an AI model made by Anthropic. Under Anthropic&apos;s commercial
                terms, essays we send for scoring are not used to train Anthropic&apos;s models. We&apos;re also building
                our own scoring model; your essays only help train it if you choose to opt in.
              </p>
            </div>
          </div>

          <ol className="flex flex-col gap-4">
            {scoringSteps.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-2xl border border-border-soft bg-white p-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy font-display text-base font-semibold text-gold-light">
                  {i + 1}
                </span>
                <div>
                  <div className="mb-1.5 font-sans text-base font-bold text-navy">{s.title}</div>
                  <p className="font-sans text-[14.5px] leading-relaxed text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
            <li className="rounded-2xl bg-navy p-6">
              <div className="mb-3 font-sans text-base font-bold text-gold-light">What the AI can&apos;t do</div>
              <ul className="flex flex-col gap-2">
                {limits.map((l) => (
                  <li key={l} className="flex gap-2.5 font-sans text-[14px] leading-relaxed text-white/75">
                    <span className="text-gold-light">—</span>
                    {l}
                  </li>
                ))}
              </ul>
              <BandDisclaimer tone="light" className="mt-4" />
            </li>
          </ol>
        </div>
      </div>

      {/* Dashboard note */}
      <div className="mx-auto max-w-[900px] px-6 pb-20 md:px-12">
        <div className="rounded-2xl border border-border-soft bg-white p-7">
          <div className="mb-2 font-sans text-base font-bold text-navy">Where do the other scores come from?</div>
          <p className="font-sans text-[14.5px] leading-relaxed text-muted">
            Your dashboard combines three kinds of score, and labels each one: <strong className="text-navy">AI estimates</strong> from
            Writing Feedback, <strong className="text-navy">teacher-assessed</strong> bands from mock tests your teacher marks, and{" "}
            <strong className="text-navy">practice tests</strong> you log yourself. The overall estimate is the average of your
            latest band in each skill, rounded the way IELTS rounds overall scores.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-navy px-6 py-20 text-center md:px-12">
        <div className="mb-4 font-display text-[28px] font-semibold text-white md:text-4xl">Try it on your next essay</div>
        <p className="mb-8 text-white/60">Get an estimated band in under a minute — and send it to your teacher with one click.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button href="/writing" size="lg">
            Open Writing Feedback
          </Button>
          <Button href="/privacy" variant="outline-navy" size="lg" className="!border-white/40 !text-white hover:!bg-white/10">
            Read our Privacy Policy
          </Button>
        </div>
      </div>
    </div>
  );
}
