import type { GrammarFlag } from "@/lib/types";

type Range = { start: number; end: number; flag: GrammarFlag; n: number };

/** The essay as written, with each flagged phrase highlighted and numbered. */
export function EssayText({ body, flags = [] }: { body: string; flags?: GrammarFlag[] }) {
  const lower = body.toLowerCase();
  const ranges: Range[] = [];
  flags.forEach((flag, i) => {
    const needle = flag.excerpt.toLowerCase();
    if (!needle) return;
    let from = 0;
    while (from < lower.length) {
      const start = lower.indexOf(needle, from);
      if (start === -1) return;
      const end = start + needle.length;
      if (!ranges.some((r) => start < r.end && end > r.start)) {
        ranges.push({ start, end, flag, n: i + 1 });
        return;
      }
      from = start + 1;
    }
  });
  ranges.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) parts.push(body.slice(cursor, r.start));
    parts.push(
      <mark
        key={r.start}
        title={`${r.flag.issue} → ${r.flag.suggestion}`}
        className="rounded-[3px] bg-[#fbeeb8] px-0.5 text-ink underline decoration-gold decoration-2 underline-offset-[3px]"
      >
        {body.slice(r.start, r.end)}
        <sup className="ml-0.5 font-sans text-[10px] font-bold text-badge-text">{r.n}</sup>
      </mark>,
    );
    cursor = r.end;
  }
  if (cursor < body.length) parts.push(body.slice(cursor));

  return <div className="whitespace-pre-wrap font-sans text-[15px] leading-[1.8] text-ink">{parts}</div>;
}
