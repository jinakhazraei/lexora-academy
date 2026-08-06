export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-block w-fit rounded-full bg-badge-bg px-2.5 py-1 font-sans text-[11px] font-bold tracking-wide text-badge-text ${className}`}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`font-sans text-[13px] font-bold uppercase tracking-[0.14em] text-gold ${className}`}>
      {children}
    </div>
  );
}
