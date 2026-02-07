"use client";

import { useMemo, useState } from "react";
import type { AskResponse } from "../lib/types";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { RunSummaryPanel } from "./RunSummaryPanel";
import { TracePanel } from "./TracePanel";

function fmt(n: number, digits = 2) {
  return Number.isFinite(n) ? n.toFixed(digits) : "?";
}

export function InspectRunPanel({ resp }: { resp: AskResponse | null }) {
  const [open, setOpen] = useState(false);

  // ✅ hooks must run every render, even when resp is null
  const meta = useMemo(() => {
    if (!resp) return { ms: "?", top: undefined as number | undefined, min: undefined as number | undefined };

    const ms = resp.trace?.timings_ms?.total ?? "?";
    const top = resp.trace?.retrieved?.[0]?.score;
    const min = resp.trace?.thresholds?.retrieve_min;
    return { ms, top, min };
  }, [resp]);

  // ✅ now safe to early return
  if (!resp) return null;

  // -------- CLOSED: compact button row (no big card) --------
  if (!open) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white/85">Inspect run</div>
          <div className="mt-0.5 text-xs text-white/55">
            Debug retrieval, thresholds, and evidence selection.
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="default">{meta.ms} ms</Badge>

          {typeof meta.min === "number" && (
            <Badge variant="default">min {fmt(meta.min, 2)}</Badge>
          )}
          {typeof meta.top === "number" && (
            <Badge variant="default">top {fmt(meta.top, 3)}</Badge>
          )}

          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Inspect
          </Button>
        </div>
      </div>
    );
  }

  // -------- OPEN: full details in a quiet GlassCard --------
  return (
    <GlassCard
      tone="quiet"
      title="Inspect run"
      subtitle="Debug retrieval, thresholds, and evidence selection."
      right={
        <div className="flex items-center gap-2">
          <Badge variant="default">{meta.ms} ms</Badge>
          {typeof meta.min === "number" && (
            <Badge variant="default">min {fmt(meta.min, 2)}</Badge>
          )}
          {typeof meta.top === "number" && (
            <Badge variant="default">top {fmt(meta.top, 3)}</Badge>
          )}
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <RunSummaryPanel resp={resp} />
        <TracePanel resp={resp} />
      </div>
    </GlassCard>
  );
}
