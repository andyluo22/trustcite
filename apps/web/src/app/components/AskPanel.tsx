"use client";

import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { Badge } from "./Badge";

export function AskPanel(props: {
  question: string;
  setQuestion: (q: string) => void;
  loading: boolean;
  onAsk: () => void;
}) {
  const canAsk = props.question.trim().length > 0 && !props.loading;

  return (
    <GlassCard
      tone = "hero"
      title="Ask"
      subtitle="Ask a question and get a per-sentence cited answer."
      right={
        props.loading ? (
          <Badge variant="info">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-200/80" />
            Thinking…
          </Badge>
        ) : (
          <Badge variant="default">Citations enforced</Badge>
        )
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold tracking-wide text-white/70">
            Question
          </label>

          <div className="mt-2">
            <input
              value={props.question}
              onChange={(e) => props.setQuestion(e.target.value)}
              placeholder="e.g., What is Vancouver known for?"
              className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35
                         focus:outline-none focus:ring-2 focus:ring-white/15"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canAsk) {
                  e.preventDefault();
                  props.onAsk();
                }
              }}
              aria-label="Question"
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-white/45">
            <span>Press Enter to ask</span>
            <span>{props.question.trim().length} chars</span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={props.onAsk}
          disabled={!canAsk}
          className="w-full h-11"
        >
          {props.loading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border border-white/30 border-t-transparent" />
              Asking…
            </>
          ) : (
            "Ask with citations"
          )}
        </Button>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/60">
          Tip: Ask specific questions. If evidence is weak, TrustCite will{" "}
          <span className="text-white/80 font-medium">abstain</span>.
        </div>
      </div>
    </GlassCard>
  );
}
