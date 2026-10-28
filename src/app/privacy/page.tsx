import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui";
import { contact } from "@/lib/data";
import { PRIVACY_VERSION } from "@/lib/ielts";

export const metadata: Metadata = {
  title: "Privacy Policy — Lexora Academy",
  description: "How Lexora Academy collects, uses and protects student data, including essays and scores.",
};

const EFFECTIVE = new Date(PRIVACY_VERSION).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

// Service providers that process data for us. Keep this list accurate.
const PROCESSORS = [
  { name: "Supabase", role: "stores your account and learning data, and handles secure login" },
  { name: "Vercel", role: "hosts the website" },
  { name: "Anthropic", role: "provides the AI model (Claude) that generates Writing Feedback" },
  { name: "Resend", role: "sends our emails, such as review notifications and contact-form messages" },
];

const summary = [
  "We store your essays and scores only after you agree.",
  "Your teachers can see your work so they can help you. Nobody else can.",
  "Your essays are sent to our AI provider to generate feedback. They are not used to train its models.",
  "We only use your essays to improve our own scoring model if you opt in — and you can change your mind.",
  "You can download or delete your data at any time from Account settings.",
  "We never sell your data or use it for advertising.",
];

export default function PrivacyPage() {
  return (
    <div className="bg-cream px-6 py-20 md:px-12 md:py-24">
      <div className="mx-auto max-w-[780px]">
        <Eyebrow className="mb-3.5">Privacy Policy</Eyebrow>
        <h1 className="mb-3 font-display text-[34px] font-semibold text-navy md:text-[44px]">Your privacy at Lexora</h1>
        <p className="mb-10 font-sans text-[14px] text-meta">Effective {EFFECTIVE} · version {PRIVACY_VERSION}</p>

        <div className="mb-12 rounded-[20px] bg-navy p-7">
          <div className="mb-4 font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-gold-light">The short version</div>
          <ul className="flex flex-col gap-2.5">
            {summary.map((s) => (
              <li key={s} className="flex gap-2.5 font-sans text-[14.5px] leading-relaxed text-white/85">
                <span className="text-gold-light">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-10 font-sans text-[15px] leading-relaxed text-ink [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-[22px] [&_h2]:font-semibold [&_h2]:text-navy [&_li]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5">
          <section>
            <h2>1. Who we are</h2>
            <p>
              Lexora Academy is an English language school in {contact.location}. We are responsible for the personal data
              described here. You can reach us at <a href={`mailto:${contact.email}`}>{contact.email}</a> or on WhatsApp at{" "}
              {contact.whatsappDisplay}.
            </p>
          </section>

          <section>
            <h2>2. What we collect</h2>
            <ul>
              <li>
                <strong>Account details:</strong> your name, email address and, if you add them, your target band and test
                date. Passwords are handled by our login provider and are never visible to us.
              </li>
              <li>
                <strong>Your learning work:</strong> the essays you submit, the questions you answer, the AI feedback, the
                practice-test scores you log, and scores and reviews from your teachers.
              </li>
              <li>
                <strong>Your choices:</strong> when you agreed to this policy, and whether you opted in to helping train our
                scoring model.
              </li>
              <li>
                <strong>Messages:</strong> anything you send us through the contact form, email or WhatsApp.
              </li>
              <li>
                <strong>Technical data:</strong> cookies that keep you logged in. Essay drafts are saved in your own browser
                until you submit them; they are not sent to us before that.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Why we use it</h2>
            <ul>
              <li>To run your student account and show your progress across Listening, Reading, Writing and Speaking.</li>
              <li>To generate AI feedback on your writing.</li>
              <li>So your teachers can review your work, record mock-test scores and plan your lessons.</li>
              <li>To send you messages you&apos;d expect, such as &ldquo;your teacher has reviewed your essay&rdquo;.</li>
              <li>
                Only if you opt in: to improve Lexora&apos;s own scoring model, using essays with your name and personal details
                removed.
              </li>
            </ul>
            <p>
              We rely on your consent to store your essays and scores, which you give with the checkbox when you create your
              account or submit your first essay. We don&apos;t sell your data, and we don&apos;t use it for advertising.
            </p>
          </section>

          <section>
            <h2>4. How the AI uses your essays</h2>
            <p>
              When you ask for Writing Feedback, your essay and the question are sent to our AI provider, Anthropic, to
              generate the feedback. Under Anthropic&apos;s commercial terms, this content is not used to train its models.
              Please don&apos;t include personal details — like your phone number or address — in your essays.
            </p>
            <p>
              All AI bands are estimates, not official IELTS scores. Read more on{" "}
              <Link href="/how-our-ai-works">How our AI works</Link>.
            </p>
          </section>

          <section>
            <h2>5. Training our own scoring model (optional)</h2>
            <p>
              We are building our own model to score IELTS essays. If — and only if — you tick the optional box, we may
              include your essays in its training data, with your name, email and any other personal details removed. You
              can turn this off at any time in <Link href="/account">Account settings</Link>; from then on, we stop including
              your essays in new training.
            </p>
          </section>

          <section>
            <h2>6. Who can see your data</h2>
            <ul>
              <li>You.</li>
              <li>Lexora Academy teachers and administrators, so they can support your learning.</li>
              <li>Service providers who process it for us, only to provide their service:</li>
            </ul>
            <ul className="!pl-10">
              {PROCESSORS.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong> — {p.role}.
                </li>
              ))}
            </ul>
            <p>
              Some of these providers store or process data outside Armenia, including in the European Union and the United
              States. We only share what each one needs. Other students can never see your work.
            </p>
          </section>

          <section>
            <h2>7. How we protect it</h2>
            <p>
              Your data is sent over encrypted connections. Our database only lets each student read their own records, and
              only staff accounts can see student work. AI and teacher scores can only be written by our system and our
              teachers, not edited by students.
            </p>
          </section>

          <section>
            <h2>8. How long we keep it</h2>
            <p>
              We keep your account and learning data while your account is open. You can delete individual essays, all your
              essays, or your whole account at any time in <Link href="/account">Account settings</Link>. Deleting your
              account removes your essays, feedback and scores from our system.
            </p>
          </section>

          <section>
            <h2>9. Your rights</h2>
            <ul>
              <li>See your data — use &ldquo;Download my data&rdquo; in Account settings.</li>
              <li>Correct it — edit your details in Account settings, or ask us.</li>
              <li>Delete it — in Account settings, or ask us.</li>
              <li>Withdraw consent — turn off model training at any time, or delete your account.</li>
              <li>Complain — contact us first, and you can also contact the personal data protection authority in Armenia.</li>
            </ul>
          </section>

          <section>
            <h2>10. Younger students</h2>
            <p>
              If you are under 16, please ask a parent or guardian to read this policy and agree to it with you before you
              create an account.
            </p>
          </section>

          <section>
            <h2>11. Changes to this policy</h2>
            <p>
              If we change this policy in a way that affects how we use your data, we&apos;ll update the date above and ask you
              to agree again before saving new work.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              Questions or requests: <a href={`mailto:${contact.email}`}>{contact.email}</a> · WhatsApp {contact.whatsappDisplay}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
