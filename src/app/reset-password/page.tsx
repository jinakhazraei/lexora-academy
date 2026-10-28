import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "@/app/reset-password/ResetPasswordForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a New Password — Lexora Academy" };

export default async function ResetPasswordPage() {
  // The reset link signs the student in via /auth/callback before landing here.
  const user = await getCurrentUser();

  return (
    <AuthShell eyebrow="Student Login" title="Choose a new password">
      {user ? (
        <ResetPasswordForm />
      ) : (
        <p className="font-sans text-sm leading-relaxed text-muted">
          This page opens from the link in your reset email. If your link has expired,{" "}
          <Link href="/forgot-password" className="font-semibold">
            request a new one
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
