import type { WhyItem } from "@/lib/data";

type IconProps = { className?: string };

const stroke = "#8a6a10";

function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="8" cy="8" r="2.4" />
      <circle cx="16" cy="8" r="2.4" />
      <path d="M4 19c0-3 2-5 4-5s4 2 4 5" />
      <path d="M12 19c0-3 2-5 4-5s4 2 4 5" />
    </svg>
  );
}

function SpeechIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 6h16v10H10l-4 4v-4H4z" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </svg>
  );
}

function CapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5 2 9l10 4 10-4-10-4z" />
      <path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
    </svg>
  );
}

function ChipIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill={stroke} />
    </svg>
  );
}

function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function GlobeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className={className} fill="none" stroke={stroke} strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

const iconMap: Record<WhyItem["icon"], (props: IconProps) => React.JSX.Element> = {
  people: PeopleIcon,
  speech: SpeechIcon,
  cap: CapIcon,
  chip: ChipIcon,
  grid: GridIcon,
  target: TargetIcon,
  clock: ClockIcon,
  globe: GlobeIcon,
};

export function WhyIcon({ icon, className }: { icon: WhyItem["icon"]; className?: string }) {
  const Cmp = iconMap[icon];
  return <Cmp className={className} />;
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" className={className} fill="#0F1B33">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
