import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import Link from "@/components/LocaleLink";
import { ForgotPasswordForm } from "@/app/[lang]/forgot-password/ForgotPasswordForm";
import { getI18n } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.forgot, robots: { index: false } };
}

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();
  return (
    <AuthShell t={t} eyebrow={t.auth.loginEyebrow} title={t.auth.forgotTitle} subtitle={t.auth.forgotSubtitle}>
      <ForgotPasswordForm />
      <p className="mt-6 font-sans text-sm text-muted">
        {t.auth.remembered}{" "}
        <Link href="/login" className="font-semibold">
          {t.auth.backToLogin}
        </Link>
      </p>
    </AuthShell>
  );
}
