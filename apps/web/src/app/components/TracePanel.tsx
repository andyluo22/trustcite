"use client";

import { useMemo, useState } from "react";
import type { AskResponse } from "../lib/types";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";
import { Button } from "./Button";

export function TracePanel(props: { resp: AskResponse | null }) {
  const [open, setOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // keep hooks above early return
  const resp = props.resp;
  const t = resp?.trace;

  const meta = useMemo(() => {
    if (!t) return null;
    return {
      ms: t.timings_ms?.total ?? "?",
      min: t.thresholds?.retrieve_min,
      top: t.retrieved?.[0]?.score,
      sanitized: Boolean(t.sanitized?.question || t.sanitized?.document),
      dropped: t.dropped_sentences ?? 0,
      fallback: Boolean(t.fallback_used),
    };
  }, [t]);

  if (!resp || !t || !meta) return null;

  const retrieveMin = t.thresholds?.retrieve_min;
  const topScore = t.retrieved?.[0]?.score;

  return (
    <GlassCard
      tone="quiet"
      title="Trace"
      subtitle="Inspect retrieval and safety signals for debugging."
      right={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide" : "Show"}
          </Button>
        </div>
      }
    >
      {/* badges go here so they wrap and never crush the title */}
      {/* <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant="default">{meta.ms} ms</Badge>
        {typeof meta.min === "number" && (
          <Badge variant="default">min {meta.min.toFixed(2)}</Badge>
        )}
        {typeof meta.top === "number" && (
          <Badge variant="default">top {meta.top.toFixed(3)}</Badge>
        )}
        {meta.fallback && <Badge variant="info">Fallback</Badge>}
        {meta.dropped > 0 && <Badge variant="warning">Dropped {meta.dropped}</Badge>}
        {meta.sanitized && <Badge variant="info">Sanitized</Badge>}
      </div> */}

      {!open ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
          Open trace to view retrieved chunks, scores, and run metadata.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold tracking-wide text-white/80">
                Retrieved evidence
              </div>
              <div className="mt-1 text-xs text-white/50">
                Top chunks used to ground the answer.
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRaw((v) => !v)}
            >
              {showRaw ? "Hide raw" : "Show raw"}
            </Button>
          </div>

          {showRaw && (
            <pre className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70 overflow-auto shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              {JSON.stringify(
                { thresholds: t.thresholds, timings_ms: t.timings_ms, sanitized: t.sanitized },
                null,
                2
              )}
            </pre>
          )}

          <div className="space-y-3">
            {t.chunks_preview.map((c) => {
              const pct =
                typeof topScore === "number" && topScore > 0
                  ? Math.max(0, Math.min(100, (c.score / topScore) * 100))
                  : Math.max(0, Math.min(100, c.score * 100));

              const above =
                typeof retrieveMin === "number" ? c.score >= retrieveMin : undefined;

              return (
                <div
                  key={c.chunk_id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/85">{c.chunk_id}</span>
                      {above !== undefined && (
                        <Badge variant={above ? "success" : "warning"}>
                          {above ? "above min" : "below min"}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        score <span className="text-white/85 font-medium">{c.score.toFixed(3)}</span>
                      </Badge>
                      <Badge variant="default">
                        chars <span className="text-white/85 font-medium">{c.start}–{c.end}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-white/40" style={{ width: `${pct}%` }} />
                  </div>

                  <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-white/70">
                    {c.text}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
