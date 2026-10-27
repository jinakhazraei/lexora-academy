import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell, NotConfiguredNotice } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { SignupForm } from "@/app/signup/SignupForm";
import { getCurrentUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/ielts";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Create a Student Account — Lexora Academy",
  description: "Create your Lexora Academy student account to track your IELTS progress.",
};

export default async function SignupPage(props: PageProps<"/signup">) {
  const params = await props.searchParams;
  const next = safeNextPath(params.next);
  if (await getCurrentUser()) redirect(next);

  return (
    <AuthShell
      eyebrow="Student Account"
      title="Create your account"
      subtitle="Save your essays, log practice tests and follow your progress across all four IELTS skills."
    >
      {isSupabaseConfigured ? (
        <>
          <GoogleButton next={next} label="Sign up with Google" />
          <SignupForm next={next} />
          <p className="mt-6 font-sans text-sm text-muted">
            Already have an account?{" "}
            <Link href={`/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold">
              Log in
            </Link>
          </p>
        </>
      ) : (
        <NotConfiguredNotice />
      )}
    </AuthShell>
  );
}
