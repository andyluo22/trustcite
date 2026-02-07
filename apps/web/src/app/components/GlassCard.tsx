// app/components/GlassCard.tsx
import type { ReactNode } from "react";

type Tone = "default" | "quiet" | "hero";

type Props = {
  title?: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** If true, removes the default padding so you can fully control the interior */
  noPadding?: boolean;
  /** Visual priority: hero (primary panel), default (normal), quiet (de-emphasized) */
  tone?: Tone;
};

export function GlassCard({
  title,
  subtitle,
  right,
  children,
  className = "",
  innerClassName = "",
  noPadding = false,
  tone = "default",
}: Props) {
  const toneBase: Record<Tone, string> = {
    // Your original look (kept)
    default: [
      "bg-white/[0.06] backdrop-blur-xl",
      "border border-white/10 ring-1 ring-white/[0.05]",
      "shadow-[0_1px_0_rgba(255,255,255,0.08),0_18px_60px_rgba(0,0,0,0.55)]",
    ].join(" "),

    // Quieter: slightly darker, less ring, less shadow
    quiet: [
      "bg-white/[0.045] backdrop-blur-lg",
      "border border-white/[0.08] ring-1 ring-white/[0.035]",
      "shadow-[0_1px_0_rgba(255,255,255,0.06),0_12px_42px_rgba(0,0,0,0.48)]",
    ].join(" "),

    // Hero: same base, slightly more premium + subtle sky ring
    hero: [
      "bg-white/[0.065] backdrop-blur-xl",
      "border border-white/12 ring-1 ring-sky-200/[0.08]",
      "shadow-[0_1px_0_rgba(255,255,255,0.09),0_22px_72px_rgba(0,0,0,0.62)]",
    ].join(" "),
  };

  // Calmer hover = less “busy”
  const hover =
    "transition-colors duration-200 " +
    "motion-safe:hover:border-white/16 motion-safe:hover:bg-white/[0.072] " +
    "motion-safe:hover:shadow-[0_1px_0_rgba(255,255,255,0.10),0_22px_70px_rgba(0,0,0,0.62)]";

  // Overlays (your original) + tone-specific tweaks
  const overlayTopLeft =
    tone === "quiet"
      ? "bg-[radial-gradient(120%_140%_at_18%_0%,rgba(255,255,255,0.10),transparent_58%)]"
      : tone === "hero"
      ? "bg-[radial-gradient(120%_140%_at_18%_0%,rgba(255,255,255,0.16),transparent_52%)]"
      : "bg-[radial-gradient(120%_140%_at_18%_0%,rgba(255,255,255,0.14),transparent_55%)]";

  const overlayBottomGlow =
    tone === "hero"
      ? "bg-[radial-gradient(120%_120%_at_50%_120%,rgba(90,180,255,0.14),transparent_55%)]"
      : tone === "quiet"
      ? "bg-[radial-gradient(120%_120%_at_50%_120%,rgba(90,180,255,0.07),transparent_58%)]"
      : "bg-[radial-gradient(120%_120%_at_50%_120%,rgba(90,180,255,0.10),transparent_55%)]";

  return (
    <section
      className={[
        "relative overflow-hidden rounded-2xl",
        toneBase[tone],
        hover,
        className,
      ].join(" ")}
    >
      {/* Top-left surface highlight (makes glass look real) */}
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-2xl",
          overlayTopLeft,
        ].join(" ")}
      />

      {/* Subtle bottom glow (ties into your horizon) */}
      <div
        className={[
          "pointer-events-none absolute inset-0 rounded-2xl",
          overlayBottomGlow,
        ].join(" ")}
      />

      {/* Hero-only accent bloom (VERY subtle) */}
      {tone === "hero" && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl">
          <div className="absolute -top-28 left-1/2 h-56 w-[760px] -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl" />
        </div>
      )}

      {/* Edge vignette (adds depth) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(120%_90%_at_50%_10%,transparent_35%,rgba(0,0,0,0.28))]" />

      <div className={["relative", noPadding ? "" : "p-5", innerClassName].join(" ")}>
        {(title || subtitle || right) && (
          <header className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <div className="truncate text-sm font-semibold tracking-wide text-white/90">
                  {title}
                </div>
              )}
              {subtitle && <div className="mt-1 text-xs text-white/55">{subtitle}</div>}
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </header>
        )}

        {children}
      </div>
    </section>
  );
}
