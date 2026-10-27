import type { Metadata } from "next";
import Link from "next/link";
import { setTrainingOptIn } from "@/app/dashboard/actions";
import { signOut } from "@/app/auth/actions";
import { DeleteAccountForm, DeleteEssaysForm, ProfileForm } from "@/app/account/AccountForms";
import { checkboxClasses } from "@/components/ConsentFields";
import { PrivacyBanner } from "@/components/dashboard/PrivacyBanner";
import { SubmitButton } from "@/components/forms";
import { Eyebrow } from "@/components/ui";
import { formatDate } from "@/components/writing/ResultsPanel";
import { hasCurrentConsent, isStaff, requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Account Settings — Lexora Academy" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const p = user.profile;

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[820px]">
        <Link href={isStaff(p) ? "/teacher" : "/dashboard"} className="mb-6 inline-block font-sans text-[13px] font-semibold">
          ← Back to {isStaff(p) ? "teacher area" : "dashboard"}
        </Link>
        <Eyebrow className="mb-3">Account</Eyebrow>
        <h1 className="mb-8 font-display text-[32px] font-semibold text-navy md:text-[38px]">Account settings</h1>

        {!hasCurrentConsent(p) && <PrivacyBanner />}

        <Card title="Your details">
          <p className="mb-5 font-sans text-[13px] text-muted">Signed in as {user.email ?? p.email}</p>
          <ProfileForm fullName={p.full_name} targetBand={p.target_band} testDate={p.test_date} />
        </Card>

        <Card title="Privacy & your data">
          <ul className="mb-6 flex flex-col gap-2 font-sans text-[13.5px] text-ink">
            <li>
              <span className="font-semibold text-navy">Storing your work: </span>
              {p.privacy_accepted_at
                ? `agreed on ${formatDate(p.privacy_accepted_at)}${p.privacy_version ? ` (policy version ${p.privacy_version})` : ""}.`
                : "not yet agreed — nothing is saved until you do."}
            </li>
            <li>
              <Link href="/privacy" className="font-semibold">
                Read the Privacy Policy
              </Link>{" "}
              ·{" "}
              <Link href="/how-our-ai-works" className="font-semibold">
                How our AI works
              </Link>
            </li>
          </ul>

          {p.privacy_accepted_at && (
            <form action={setTrainingOptIn} className="mb-6 rounded-xl border border-border-soft bg-cream/60 p-4">
              <label className="mb-3 flex cursor-pointer gap-3 font-sans text-[13px] leading-relaxed text-ink">
                <input type="checkbox" name="training_opt_in" defaultChecked={p.training_opt_in} className={checkboxClasses} />
                <span>
                  Allow my essays, with my name and details removed, to be used to train Lexora&apos;s own scoring model.
                  {p.training_opt_in && p.training_opt_in_at && (
                    <span className="text-meta"> (Turned on {formatDate(p.training_opt_in_at)}.)</span>
                  )}
                </span>
              </label>
              <SubmitButton variant="outline-navy" pendingLabel="Saving…" className="!px-4 !py-2 !text-[12.5px]">
                Save choice
              </SubmitButton>
            </form>
          )}

          <div className="mb-6">
            <a
              href="/account/export"
              className="inline-flex rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white"
            >
              Download my data
            </a>
            <p className="mt-2 font-sans text-[12.5px] text-meta">A JSON file with your profile, essays, feedback and scores.</p>
          </div>

          <div className="flex flex-col gap-6 border-t border-cream-alt pt-6">
            <DeleteEssaysForm />
            <DeleteAccountForm />
          </div>
        </Card>

        <form action={signOut}>
          <SubmitButton variant="outline-navy" pendingLabel="Signing out…">
            Sign out
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-[20px] border border-border-soft bg-white p-6 sm:p-7">
      <h2 className="mb-4 font-sans text-xs font-bold uppercase tracking-[0.1em] text-navy">{title}</h2>
      {children}
    </section>
  );
}
