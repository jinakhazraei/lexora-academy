"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/Button";
import { inputClasses, labelClasses } from "@/components/forms";
import { useI18n } from "@/i18n/client";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  initialCourse,
  courses,
}: {
  initialCourse?: string;
  courses: { id: string; name: string }[];
}) {
  const { lang, t } = useI18n();
  const f = t.contactForm;
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          phone: value("phone"),
          course: value("course"),
          message: value("message"),
          lang,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-[20px] border border-border-soft bg-white p-10 text-center">
        <div className="mb-2 font-display text-xl font-semibold text-navy">{f.thanksTitle}</div>
        <p className="font-sans text-sm leading-relaxed text-muted">{f.thanksText}</p>
        <Button variant="outline-navy" className="mt-6" onClick={() => setStatus("idle")}>
          {f.another}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[20px] border border-border-soft bg-white p-6 sm:p-10">
      <div className="flex flex-col gap-[18px]">
        <div>
          <label htmlFor="name" className={labelClasses}>
            {f.name}
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" placeholder={f.namePlaceholder} className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className={labelClasses}>
            {f.email}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClasses}>
            {f.phone}
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+374" className={inputClasses} />
        </div>
        <div>
          <label htmlFor="course" className={labelClasses}>
            {f.course}
          </label>
          <select id="course" name="course" defaultValue={initialCourse ?? ""} className={inputClasses}>
            <option value="">{f.selectCourse}</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="message" className={labelClasses}>
            {f.message}
          </label>
          <textarea id="message" name="message" rows={3} placeholder={f.messagePlaceholder} className={inputClasses} />
        </div>
        {status === "error" && <div role="alert" className="font-sans text-[13px] font-semibold text-red-600">{f.error}</div>}
        <Button type="submit" disabled={status === "submitting"} className="mt-1.5 w-full">
          {status === "submitting" ? f.submitting : f.submit}
        </Button>
      </div>
    </form>
  );
}
