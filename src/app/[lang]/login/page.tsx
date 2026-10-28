import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { AuthErrorCode } from "@/app/auth/actions";
import { AuthShell, MissingProfileNotice, NotConfiguredNotice } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import Link from "@/components/LocaleLink";
import { LoginForm } from "@/app/[lang]/login/LoginForm";
import { getI18n } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/ielts";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.login, robots: { index: false } };
}

const LINK_ERRORS: AuthErrorCode[] = ["link", "google"];

export default async function LoginPage(props: PageProps<"/[lang]/login">) {
  const { lang, t } = await getI18n();
  const params = await props.searchParams;
  const next = safeNextPath(params.next, `/${lang}/dashboard`);
  const user = await getCurrentUser();
  if (user?.profile) redirect(next);

  const errorKey = LINK_ERRORS.find((e) => e === params.error);
  const signupHref = `/signup${next !== `/${lang}/dashboard` ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <AuthShell t={t} eyebrow={t.auth.loginEyebrow} title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      {user ? (
        <MissingProfileNotice t={t} />
      ) : isSupabaseConfigured ? (
        <>
          <GoogleButton next={next} lang={lang} t={t} />
          <LoginForm next={next} initialError={errorKey} />
          <p className="mt-6 font-sans text-sm text-muted">
            {t.auth.newHere}{" "}
            <Link href={signupHref} className="font-semibold">
              {t.auth.createLink}
            </Link>
          </p>
        </>
      ) : (
        <NotConfiguredNotice t={t} />
      )}
    </AuthShell>
  );
}
