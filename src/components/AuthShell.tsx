import Image from "next/image";
import { Eyebrow } from "@/components/ui";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream px-4 py-14 md:px-12 md:py-20">
      <div className="mx-auto grid max-w-[1000px] grid-cols-1 overflow-hidden rounded-[20px] border border-border-soft bg-white shadow-[0_8px_24px_rgba(15,27,51,0.05)] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative hidden min-h-[520px] bg-navy md:block">
          <Image
            src="/images/hands-typing-notebook.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 0px, 440px"
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(10,20,40,0.55),rgba(15,27,51,0.92))]" />
          <div className="relative flex h-full flex-col justify-end p-9">
            <div className="mb-3 font-display text-[26px] font-semibold leading-snug text-white">
              Track every skill. See every step forward.
            </div>
            <p className="font-sans text-sm leading-relaxed text-white/65">
              Your essays, practice scores and teacher feedback in one place — with AI estimates that work alongside
              your teacher, never instead of them.
            </p>
          </div>
        </div>
        <div className="p-7 sm:p-10">
          <Eyebrow className="mb-2.5">{eyebrow}</Eyebrow>
          <h1 className="mb-2 font-display text-[28px] font-semibold text-navy md:text-[32px]">{title}</h1>
          {subtitle && <p className="mb-7 font-sans text-sm leading-relaxed text-muted">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

export function NotConfiguredNotice() {
  return (
    <div className="rounded-lg border border-border-soft bg-badge-bg px-4 py-3.5 font-sans text-[13px] leading-relaxed text-badge-text">
      Student accounts are being set up. In the meantime, contact us on WhatsApp or by email and we&apos;ll help you
      directly.
    </div>
  );
}
