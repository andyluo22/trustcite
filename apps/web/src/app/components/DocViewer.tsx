"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Citation } from "../lib/types";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";
import { Button } from "./Button";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function DocViewer(props: { text: string; active: Citation | null }) {
  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const parts = useMemo(() => {
    const text = props.text ?? "";
    const c = props.active;
    if (!c) return { before: text, mid: "", after: "", range: null as null | { s: number; e: number } };

    const s = clamp(c.start, 0, text.length);
    const e = clamp(c.end, 0, text.length);
    const start = Math.min(s, e);
    const end = Math.max(s, e);

    return {
      before: text.slice(0, start),
      mid: text.slice(start, end),
      after: text.slice(end),
      range: { s: start, e: end },
    };
  }, [props.text, props.active]);

  useEffect(() => {
    if (!props.active) return;
    highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [props.active]);

  const activeLabel = props.active
    ? `${props.active.chunk_id} [${props.active.start},${props.active.end})`
    : null;

  return (
    <GlassCard
      title="Viewer"
      subtitle="Read the document and inspect highlighted evidence spans."
      right={
        <div className="flex items-center gap-2">
          {props.active ? (
            <>
              <Badge variant="info">Highlighted</Badge>
              <Badge variant="default">
                <span className="font-mono text-white/75">{activeLabel}</span>
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" })}>
                Top
              </Button>
            </>
          ) : (
            <Badge variant="default">No highlight</Badge>
          )}
        </div>
      }
    >
      <div
        ref={scrollerRef}
        className="mt-1 h-[420px] overflow-auto rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-relaxed text-white/80
                   shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <div className="whitespace-pre-wrap">
          <span className="text-white/70">{parts.before}</span>

          {parts.mid && (
            <mark
              className="rounded-lg px-1.5 py-0.5"
              style={{
                background:
                  "linear-gradient(180deg, rgba(80,180,255,0.22), rgba(80,180,255,0.12))",
                color: "inherit",
              }}
            >
              <span
                ref={highlightRef}
                className="rounded-md ring-1 ring-white/20"
              >
                {parts.mid}
              </span>
            </mark>
          )}

          <span className="text-white/70">{parts.after}</span>
        </div>

        {/* Small footer hint */}
        <div className="mt-5 border-t border-white/10 pt-4 text-xs text-white/45">
          Tip: Click a citation chip in the answer to jump to its exact span here.
          {parts.range && (
            <span className="ml-2 font-mono text-white/55">
              span {parts.range.s}–{parts.range.e}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
