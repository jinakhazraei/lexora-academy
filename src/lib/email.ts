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
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lexora-academy-institute.online").replace(/\/$/, "");
}
