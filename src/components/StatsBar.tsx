import { stats } from "@/lib/data";

export function StatsBar({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`mx-auto grid max-w-[1320px] grid-cols-2 gap-5 rounded-[20px] bg-navy md:grid-cols-4 ${
        compact ? "p-6" : "p-6 md:p-12"
      }`}
    >
      {stats.map((s) => (
        <div key={s.label} className="px-2 text-center">
          <div
            className={`font-display font-semibold text-gold-light ${
              compact ? "text-2xl" : "text-3xl md:text-[38px]"
            }`}
          >
            {s.value}
          </div>
          <div className="mt-1.5 font-sans text-[11px] font-semibold text-white/65 md:text-[13px]">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
