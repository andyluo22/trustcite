"use client";

import { useMemo } from "react";
import type { AskResponse, Citation } from "../lib/types";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";
import { Button } from "./Button";

export function AnswerPanel(props: {
  resp: AskResponse | null;
  loading: boolean;
  error: string | null;
  onPickCitation: (c: Citation) => void;
}) {
  const meta = useMemo(() => {
    const r = props.resp;
    const total = r?.trace?.timings_ms?.total;
    const dropped = r?.trace?.dropped_sentences ?? 0;
    const fallback = Boolean(r?.trace?.fallback_used);
    const sanitized = Boolean(r?.trace?.sanitized?.question || r?.trace?.sanitized?.document);
    return { total, dropped, fallback, sanitized };
  }, [props.resp]);

  const copyText = useMemo(() => {
    if (!props.resp || props.resp.abstained) return "";
    return props.resp.answer.map((a) => a.sentence).join(" ");
  }, [props.resp]);

  // ---------- Loading ----------
  if (props.loading) {
    return (
      <GlassCard
        title="Final answer"
        subtitle="Generating a cited answer from retrieved evidence."
        right={<Badge variant="info">Thinking…</Badge>}
      >
        <div className="space-y-3">
          <div className="h-4 w-2/3 rounded-lg bg-white/10" />
          <div className="h-4 w-full rounded-lg bg-white/10" />
          <div className="h-4 w-11/12 rounded-lg bg-white/10" />
          <div className="h-4 w-3/4 rounded-lg bg-white/10" />
          <div className="mt-2 text-xs text-white/50">
            Tip: If evidence is weak, TrustCite will abstain.
          </div>
        </div>
      </GlassCard>
    );
  }

  // ---------- Error ----------
  if (props.error) {
    return (
      <GlassCard
        title="Final answer"
        subtitle="Something went wrong while generating the answer."
        right={<Badge variant="danger">Error</Badge>}
      >
        <div className="rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {props.error}
        </div>
      </GlassCard>
    );
  }

  // ---------- Empty ----------
  if (!props.resp) {
    return (
      <GlassCard
        title="Final answer"
        subtitle="Your answer will appear here with per-sentence citations."
        right={<Badge variant="default">No run yet</Badge>}
      >
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
          No response yet. Ask a question to generate an answer.
        </div>
      </GlassCard>
    );
  }

  const resp = props.resp;

  return (
    <GlassCard
      title="Final answer"
      subtitle={resp.abstained ? "Abstained due to insufficient evidence." : "Cited answer generated from the document."}
      right={
        <div className="flex items-center gap-2">
          <Badge variant={resp.abstained ? "warning" : "success"}>
            {resp.abstained ? "Abstained" : "Answered"}
          </Badge>

          <Badge variant="default">{meta.total ?? "?"} ms</Badge>

          {meta.fallback && <Badge variant="info">Fallback</Badge>}
          {meta.dropped > 0 && <Badge variant="warning">Dropped {meta.dropped}</Badge>}
          {meta.sanitized && <Badge variant="info">Sanitized</Badge>}
        </div>
      }
    >
      {resp.abstained ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-4">
          <div className="text-sm font-medium text-amber-100">Not enough evidence above threshold.</div>
          <div className="mt-1 text-sm text-amber-100/70">
            Try asking a narrower question or add more relevant text to the document.
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="warning">Ask more specifically</Badge>
            <Badge variant="warning">Add supporting context</Badge>
            <Badge variant="warning">Try a different phrasing</Badge>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(copyText);
                } catch {
                  // no-op (clipboard can fail on some contexts)
                }
              }}
            >
              Copy answer
            </Button>
          </div>

          {/* Answer sentences */}
          <div className="space-y-3">
            {resp.answer.map((a, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <div className="text-sm leading-relaxed text-white/85">{a.sentence}</div>

                {a.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {a.citations.map((c, j) => (
                      <button
                        key={j}
                        onClick={() => props.onPickCitation(c)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs
                                   font-mono text-white/75 hover:bg-white/[0.10] hover:border-white/20
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-white/15"
                        title={`Highlight ${c.chunk_id} [${c.start}, ${c.end})`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                        {c.chunk_id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verification scores (if present) */}
      {resp.trace.verification_scores && resp.trace.verification_scores.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="text-xs font-semibold tracking-wide text-white/70">Verification</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {resp.trace.verification_scores.map((s, i) => (
              <Badge key={i} variant="default">
                {s.toFixed(2)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
