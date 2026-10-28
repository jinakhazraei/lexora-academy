import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell, MissingProfileNotice, NotConfiguredNotice } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { LoginForm } from "@/app/login/LoginForm";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/ielts";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Student Login — Lexora Academy",
  description: "Log in to your Lexora Academy student dashboard.",
};

const ERRORS: Record<string, string> = {
  link: "That link has expired or was already used. Please log in, or request a new link.",
  google: "Google sign-in didn't work. Please try again or use your email and password.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const next = safeNextPath(params.next);
  const user = await getCurrentUser();
  if (user?.profile) redirect(next);

  const errorKey = typeof params.error === "string" ? params.error : "";

  return (
    <AuthShell eyebrow="Student Login" title="Welcome back" subtitle="Log in to see your progress, essays and teacher feedback.">
      {user ? (
        <MissingProfileNotice />
      ) : isSupabaseConfigured ? (
        <>
          <GoogleButton next={next} />
          <LoginForm next={next} initialError={ERRORS[errorKey]} />
          <p className="mt-6 font-sans text-sm text-muted">
            New to Lexora?{" "}
            <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold">
              Create a student account
            </Link>
          </p>
        </>
      ) : (
        <NotConfiguredNotice />
      )}
    </AuthShell>
  );
}
