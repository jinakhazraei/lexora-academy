import { Resend } from "resend";
import { courses } from "@/lib/data";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  course?: string;
  message?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: ContactPayload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const courseId = body.course?.trim() ?? "";

  if (!name || !email || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please provide a valid name and email." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "mahtablexora@gmail.com";
  const fromEmail = process.env.CONTACT_FROM_EMAIL ?? "Lexora Academy <onboarding@resend.dev>";

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured.");
    return Response.json(
      { error: "Contact form is not configured yet. Please email or WhatsApp us directly." },
      { status: 500 }
    );
  }

  const courseName = courses.find((c) => c.id === courseId)?.name ?? (courseId || "Not specified");

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `New consultation request from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Course of interest: ${courseName}`,
      "",
      "Message:",
      message || "(no message provided)",
    ].join("\n"),
  });

  if (error) {
    console.error("Resend error:", error);
    return Response.json({ error: "Failed to send your message. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true });
}
