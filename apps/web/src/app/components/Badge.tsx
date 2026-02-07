import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "danger" | "info";

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs " +
    "border backdrop-blur-md";

  const variants: Record<Variant, string> = {
    default: "bg-white/7 text-white/70 border-white/10",
    success: "bg-emerald-500/10 text-emerald-200 border-emerald-400/15",
    warning: "bg-amber-500/10 text-amber-200 border-amber-400/15",
    danger: "bg-red-500/10 text-red-200 border-red-400/15",
    info: "bg-sky-500/10 text-sky-200 border-sky-400/15",
  };

  return (
    <span className={[base, variants[variant], className].join(" ")}>
      {children}
    </span>
  );
}
