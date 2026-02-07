import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  disabled,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium " +
    "transition active:translate-y-[0.5px] active:scale-[0.995] " +
    "disabled:opacity-50 disabled:pointer-events-none " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:ring-offset-0";

  const sizes =
    size === "sm" ? "h-9 px-3 text-sm" : "h-10 px-4 text-sm";

  const variants: Record<Variant, string> = {
    // Primary: “midnight ink” — subtle, premium, never white
    primary:
        "bg-black/35 text-white " +
        "border border-white/14 hover:border-white/22 " +
        "hover:bg-black/45 " +
        "shadow-[0_16px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.10)] " +
        "active:bg-black/55",

    // Secondary: true glass button (what you’ll use most)
    secondary:
        "bg-white/10 text-white " +
        "border border-white/10 hover:border-white/18 " +
        "hover:bg-white/14 " +
        "shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] " +
        "active:bg-white/16",

    // Ghost: minimal, no border, but still feels interactive
    ghost:
        "bg-transparent text-white/85 " +
        "border border-transparent " +
        "hover:bg-white/8 hover:text-white " +
        "active:bg-white/10",

    // Danger: still restrained (no neon red), keeps glass feel
    danger:
        "bg-red-500/12 text-red-200 " +
        "border border-red-300/20 hover:border-red-200/30 " +
        "hover:bg-red-500/16 " +
        "shadow-[0_10px_30px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] " +
        "active:bg-red-500/20",
    };


  return (
    <button
      className={[base, sizes, variants[variant], className].join(" ")}
      disabled={disabled}
      {...props}
    />
  );
}
