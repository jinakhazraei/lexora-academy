import { WhyIcon } from "@/components/Icons";
import type { Dictionary } from "@/i18n/dictionaries";
import { whyIcons } from "@/lib/data";

export function WhyLexoraGrid({ t }: { t: Dictionary }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {whyIcons.map((icon) => {
        const item = t.content.why[icon];
        return (
          <div key={icon} className="rounded-2xl border border-border-soft bg-white p-7">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-badge-bg">
              <WhyIcon icon={icon} />
            </div>
            <div className="mb-2 font-sans text-base font-bold text-navy">{item.title}</div>
            <div className="font-sans text-sm leading-relaxed text-muted">{item.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
