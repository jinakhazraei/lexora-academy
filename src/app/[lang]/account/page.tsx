import type { Metadata } from "next";
import { DeleteAccountForm, DeleteEssaysForm, ProfileForm } from "@/app/[lang]/account/AccountForms";
import { signOut } from "@/app/auth/actions";
import { checkboxClasses } from "@/components/ConsentFields";
import { PrivacyBanner } from "@/components/dashboard/PrivacyBanner";
import { SubmitButton } from "@/components/forms";
import Link from "@/components/LocaleLink";
import { Eyebrow } from "@/components/ui";
import { fmt, formatDate } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import { setTrainingOptIn } from "@/lib/actions/dashboard";
import { hasCurrentConsent, isStaff, requireUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.account, robots: { index: false } };
}

export default async function AccountPage() {
  const { lang, t } = await getI18n();
  const a = t.account;
  const user = await requireUser(`/${lang}/account`);
  const p = user.profile;

  return (
    <div className="bg-cream px-4 py-12 sm:px-6 md:px-12 md:py-16">
      <div className="mx-auto max-w-[820px]">
        <Link href={isStaff(p) ? "/teacher" : "/dashboard"} className="mb-6 inline-block font-sans text-[13px] font-semibold">
          {isStaff(p) ? a.backTeacher : a.back}
        </Link>
        <Eyebrow className="mb-3">{a.eyebrow}</Eyebrow>
        <h1 className="mb-8 font-display text-[32px] font-semibold text-navy md:text-[38px]">{a.title}</h1>

        {!hasCurrentConsent(p) && <PrivacyBanner />}

        <Card title={a.details}>
          <p className="mb-5 break-words font-sans text-[13px] text-muted">{fmt(a.signedInAs, { email: user.email ?? p.email ?? "" })}</p>
          <ProfileForm fullName={p.full_name} targetBand={p.target_band} testDate={p.test_date} />
        </Card>

        <Card title={a.privacyTitle}>
          <ul className="mb-6 flex flex-col gap-2 font-sans text-[13.5px] text-ink">
            <li>
              <span className="font-semibold text-navy">{a.storing} </span>
              {p.privacy_accepted_at
                ? fmt(a.agreedOn, { date: formatDate(p.privacy_accepted_at, lang), version: p.privacy_version ?? "—" })
                : a.notAgreed}
            </li>
            <li>
              <Link href="/privacy" className="font-semibold">
                {a.readPolicy}
              </Link>{" "}
              ·{" "}
              <Link href="/how-our-ai-works" className="font-semibold">
                {a.howAi}
              </Link>
            </li>
          </ul>

          {p.privacy_accepted_at && (
            <form action={setTrainingOptIn} className="mb-6 rounded-xl border border-border-soft bg-cream/60 p-4">
              <label className="mb-3 flex cursor-pointer gap-3 font-sans text-[13px] leading-relaxed text-ink">
                <input type="checkbox" name="training_opt_in" defaultChecked={p.training_opt_in} className={checkboxClasses} />
                <span>
                  {a.trainingLabel}
                  {p.training_opt_in && p.training_opt_in_at && (
                    <span className="text-meta"> {fmt(a.trainingOn, { date: formatDate(p.training_opt_in_at, lang) })}</span>
                  )}
                </span>
              </label>
              <SubmitButton variant="outline-navy" pendingLabel={t.common.saving} className="!px-4 !py-2 !text-[12.5px]">
                {a.saveChoice}
              </SubmitButton>
            </form>
          )}

          <div className="mb-6">
            {/* A plain link on purpose: the browser downloads the JSON file. */}
            <a
              href="/api/account/export"
              download
              className="inline-flex rounded-lg border-[1.5px] border-navy px-4 py-2.5 font-sans text-[13px] font-bold text-navy hover:bg-navy hover:text-white"
            >
              {a.download}
            </a>
            <p className="mt-2 font-sans text-[12.5px] text-meta">{a.downloadHint}</p>
          </div>

          <div className="flex flex-col gap-6 border-t border-cream-alt pt-6">
            <DeleteEssaysForm />
            <DeleteAccountForm />
          </div>
        </Card>

        <form action={signOut}>
          <input type="hidden" name="lang" value={lang} />
          <SubmitButton variant="outline-navy" pendingLabel={t.common.signingOut}>
            {t.common.signOut}
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
