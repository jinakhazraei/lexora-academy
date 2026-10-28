import Link from "@/components/LocaleLink";

type Variant = "gold" | "outline-navy" | "navy" | "text-gold";

const variantClasses: Record<Variant, string> = {
  gold: "bg-gold text-navy hover:brightness-95",
  "outline-navy": "border-[1.5px] border-navy bg-transparent text-navy hover:bg-navy hover:text-white",
  navy: "bg-navy text-white hover:bg-navy-panel",
  "text-gold": "border-b-[1.5px] border-gold bg-transparent px-1 py-2 text-muted hover:text-navy",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-sans font-bold cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60";

type CommonProps = {
  variant?: Variant;
  size?: "md" | "lg";
  className?: string;
  children: React.ReactNode;
};

type ButtonProps = CommonProps & {
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  variant = "gold",
  size = "md",
  className = "",
  children,
  href,
  target,
  rel,
  type = "button",
  disabled,
  onClick,
}: ButtonProps) {
  const sizeClasses = variant === "text-gold" ? "" : size === "lg" ? "px-8 py-4 text-[15.5px]" : "px-5 py-3 text-[13.5px]";
  const cls = `${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
