import type { AskResponse } from "../lib/types";
import { GlassCard } from "./GlassCard";
import { Badge } from "./Badge";

type Props = {
  resp: AskResponse | null;
};

export function RunSummaryPanel({ resp }: Props) {
  if (!resp) return null;

  const totalMs = resp.trace.timings_ms?.total ?? "?";
  const retrieved = resp.trace.retrieved?.length ?? 0;
  const dropped = resp.trace.dropped_sentences ?? 0;
  const fallback = Boolean(resp.trace.fallback_used);
  const sanitizedQ = Boolean(resp.trace.sanitized?.question);
  const sanitizedD = Boolean(resp.trace.sanitized?.document);

  return (
    <GlassCard
      tone = "quiet"
      title="Run summary"
      subtitle="Signals and performance for this run."
      className="overflow-hidden"
      right={
        <div className="flex items-center gap-2">
          <Badge variant={resp.abstained ? "warning" : "success"}>
            {resp.abstained ? "Abstained" : "Answered"}
          </Badge>
          <Badge variant="default">{totalMs} ms</Badge>
        </div>
      }
    >
      {/* Metric pills */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="default">
          retrieved <span className="text-white/85 font-medium">{retrieved}</span>
        </Badge>

        <Badge variant={dropped > 0 ? "warning" : "default"}>
          dropped <span className="text-white/85 font-medium">{dropped}</span>
        </Badge>

        <Badge variant={fallback ? "info" : "default"}>
          fallback <span className="text-white/85 font-medium">{String(fallback)}</span>
        </Badge>

        <Badge variant={sanitizedQ || sanitizedD ? "info" : "default"}>
          sanitized{" "}
          <span className="text-white/85 font-medium">
            q={String(sanitizedQ)} d={String(sanitizedD)}
          </span>
        </Badge>
      </div>

      {/* Optional: thresholds / retrieve_min if you have it */}
      {resp.trace.thresholds?.retrieve_min != null && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="text-xs font-semibold tracking-wide text-white/70">
            Thresholds
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="default">
              retrieve_min{" "}
              <span className="text-white/85 font-medium">
                {resp.trace.thresholds.retrieve_min}
              </span>
            </Badge>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

