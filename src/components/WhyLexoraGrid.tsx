import { whyItems } from "@/lib/data";
import { WhyIcon } from "@/components/Icons";

export function WhyLexoraGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {whyItems.map((item) => (
        <div key={item.title} className="rounded-2xl border border-border-soft bg-white p-7">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-badge-bg">
            <WhyIcon icon={item.icon} />
          </div>
          <div className="mb-2 font-sans text-base font-bold text-navy">{item.title}</div>
          <div className="font-sans text-sm leading-relaxed text-muted">{item.desc}</div>
        </div>
      ))}
    </div>
  );
}
