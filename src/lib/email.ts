import "server-only";
import { Resend } from "resend";

/** Sends a plain-text notification through Resend. Never throws — email is a nice-to-have here. */
export async function sendNotification(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !to) return false;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Lexora Academy <onboarding@resend.dev>";
  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to, subject, text });
    if (error) console.error("Resend error:", error);
    return !error;
  } catch (err) {
    console.error("Email failed:", err);
    return false;
  }
}

export function siteUrl() {
  // On a Vercel preview, email links should open the preview, not the live site.
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lexora-academy-institute.online").replace(/\/$/, "");
}
