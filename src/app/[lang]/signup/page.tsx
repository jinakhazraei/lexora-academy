import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell, MissingProfileNotice, NotConfiguredNotice } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import Link from "@/components/LocaleLink";
import { SignupForm } from "@/app/[lang]/signup/SignupForm";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/ielts";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.signup, robots: { index: false } };
}

export default async function SignupPage(props: PageProps<"/[lang]/signup">) {
  const { lang, t } = await getI18n();
  const params = await props.searchParams;
  const next = safeNextPath(params.next, `/${lang}/dashboard`);
  const user = await getCurrentUser();
  if (user?.profile) redirect(next);

  const loginHref = `/login${next !== `/${lang}/dashboard` ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <AuthShell t={t} eyebrow={t.auth.signupEyebrow} title={t.auth.signupTitle} subtitle={t.auth.signupSubtitle}>
      {user ? (
        <MissingProfileNotice t={t} />
      ) : isSupabaseConfigured ? (
        <>
          <GoogleButton next={next} lang={lang} t={t} signup />
          <SignupForm next={next} />
          <p className="mt-6 font-sans text-sm text-muted">
            {t.auth.haveAccount}{" "}
            <Link href={loginHref} className="font-semibold">
              {t.auth.loginLink}
            </Link>
          </p>
        </>
      ) : (
        <NotConfiguredNotice t={t} />
      )}
    </AuthShell>
  );
}
