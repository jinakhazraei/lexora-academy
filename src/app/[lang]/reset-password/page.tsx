import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import Link from "@/components/LocaleLink";
import { ResetPasswordForm } from "@/app/[lang]/reset-password/ResetPasswordForm";
import { rich } from "@/i18n/rich";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.reset, robots: { index: false } };
}

export default async function ResetPasswordPage() {
  const { t } = await getI18n();
  // The reset link signs the student in via /auth/callback before landing here.
  const user = await getCurrentUser();

  return (
    <AuthShell t={t} eyebrow={t.auth.loginEyebrow} title={t.auth.resetTitle}>
      {user ? (
        <ResetPasswordForm />
      ) : (
        <p className="font-sans text-sm leading-relaxed text-muted">
          {rich(t.auth.resetExpired, {
            link: (
              <Link href="/forgot-password" className="font-semibold">
                {t.auth.requestNew}
              </Link>
            ),
          })}
        </p>
      )}
    </AuthShell>
  );
}
