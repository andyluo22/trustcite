export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base */}
      <div className="absolute inset-0 bg-[#05070f]" />

      {/* Mesh glows (2–3 accents, controlled) */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: [
            // cool top-left bloom
            "radial-gradient(900px 520px at 18% -10%, rgba(120,190,255,0.14), transparent 60%)",
            // faint violet top-right hint
            "radial-gradient(800px 520px at 92% 10%, rgba(170,130,255,0.10), transparent 62%)",
            // horizon glow (kept restrained)
            "radial-gradient(1100px 700px at 55% 115%, rgba(60,140,235,0.26), transparent 62%)",
          ].join(", "),
        }}
      />

      {/* Atmospheric “lift” near the horizon (very subtle) */}
      <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-[linear-gradient(to_top,rgba(255,255,255,0.05),transparent_55%)] opacity-40" />

      {/* Stars (masked so they don’t look like a repeating grid) */}
      <div className="absolute inset-0">
        <div
          className={[
            "absolute inset-0 opacity-[0.22]",
            // mask: most stars near the top, fade toward bottom + corners
            "[mask-image:radial-gradient(70%_55%_at_50%_18%,black,transparent_75%)]",
            // 3 layers with “non-multiple” sizes to avoid obvious tiling
            "[background-image:",
            "radial-gradient(rgba(255,255,255,0.55)_0.6px,transparent_0.7px),",
            "radial-gradient(rgba(255,255,255,0.35)_0.9px,transparent_1.05px),",
            "radial-gradient(rgba(255,255,255,0.22)_1.2px,transparent_1.5px)",
            "]",
            "[background-size:233px_197px, 379px_353px, 587px_521px]",
            "[background-position:0_0, 120px_80px, 210px_40px]",
          ].join(" ")}
        />
      </div>

      {/* Grain (kills banding, makes it feel “film”) */}
      <div className="absolute inset-0 opacity-[0.055] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.35%22/></svg>')]" />

      {/* Subtle vignette (don’t crush edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_95%_at_50%_20%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.45)_70%,rgba(0,0,0,0.72)_100%)]" />
    </div>
  );
}
