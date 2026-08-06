"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { courses } from "@/lib/data";

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "w-full rounded-lg border border-border-soft px-3.5 py-3 font-sans text-sm text-ink placeholder:text-placeholder focus:border-gold focus:outline-none";
const labelClasses = "mb-1.5 block font-sans text-[13px] font-semibold text-navy";

export function ContactForm({ initialCourse }: { initialCourse?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      course: (form.elements.namedItem("course") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[20px] border border-border-soft bg-white p-10 text-center">
        <div className="mb-2 font-display text-xl font-semibold text-navy">Thank you!</div>
        <p className="font-sans text-sm leading-relaxed text-muted">
          Your message has been sent. We&apos;ll get back to you shortly to schedule your free consultation.
        </p>
        <Button variant="outline-navy" className="mt-6" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[20px] border border-border-soft bg-white p-10">
      <div className="flex flex-col gap-[18px]">
        <div>
          <label htmlFor="name" className={labelClasses}>
            Full name
          </label>
          <input id="name" name="name" type="text" required placeholder="Your name" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClasses}>
            Phone / WhatsApp
          </label>
          <input id="phone" name="phone" type="tel" placeholder="+374" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="course" className={labelClasses}>
            Course of interest
          </label>
          <select id="course" name="course" defaultValue={initialCourse ?? ""} className={inputClasses}>
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className={labelClasses}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            placeholder="Tell us about your goals..."
            className={inputClasses}
          />
        </div>
        {status === "error" && (
          <div className="font-sans text-[13px] font-semibold text-red-600">{errorMessage}</div>
        )}
        <Button type="submit" disabled={status === "submitting"} className="mt-1.5 w-full">
          {status === "submitting" ? "Sending…" : "Request Free Consultation"}
        </Button>
      </div>
    </form>
  );
}
