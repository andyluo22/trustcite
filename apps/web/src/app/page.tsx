"use client";

import { useMemo, useState } from "react";

type Citation = { chunk_id: string; start: number; end: number };
type AnswerSentence = { sentence: string; citations: Citation[] };

type AskResponse = {
  answer: AnswerSentence[];
  abstained: boolean;
  trace: {
    retrieved: { chunk_id: string; score: number }[];
    thresholds: { retrieve_min: number };
    timings_ms: Record<string, number>;
  };
};

export default function Home() {
  const [documentText, setDocumentText] = useState(
    "Vancouver is a coastal city in British Columbia. It is known for its film industry.\n\nThis is a tiny demo doc for Day 1."
  );
  const [question, setQuestion] = useState("What is Vancouver known for?");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const pretty = useMemo(() => (resp ? JSON.stringify(resp, null, 2) : ""), [resp]);

  async function onAsk() {
    setLoading(true);
    setError(null);
    setResp(null);

    try {
      const r = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, document_text: documentText }),
      });

      if (!r.ok) {
        const t = await r.text();
        throw new Error(`API error ${r.status}: ${t}`);
      }

      const data = (await r.json()) as AskResponse;
      setResp(data);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function loadDemoDoc() {
    setDocumentText(
      `TrustCite Demo Doc\n\n` +
        `This system answers questions only using the provided document.\n` +
        `If it cannot find evidence, it will abstain.\n\n` +
        `Vancouver is a coastal city in British Columbia. It is known for its film industry.`
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-semibold tracking-tight">TrustCite</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Trustworthy long-document QA with per-sentence citations + abstain + trace.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Left: document */}
          <section className="border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Document</h2>
              <button
                onClick={loadDemoDoc}
                className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Load demo document
              </button>
            </div>
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              className="mt-3 w-full h-[420px] border rounded-lg p-3 text-sm font-mono"
            />
          </section>

          {/* Right: ask */}
          <section className="border rounded-xl p-4">
            <h2 className="font-medium">Ask</h2>

            <label className="block mt-3 text-sm">Question</label>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 text-sm"
            />

            <button
              onClick={onAsk}
              disabled={loading}
              className="mt-3 w-full rounded-lg bg-black text-white py-2 text-sm disabled:opacity-60"
            >
              {loading ? "Asking..." : "Ask with citations"}
            </button>

            {error && (
              <div className="mt-3 text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-sm font-medium">Response</h3>
              <pre className="mt-2 text-xs bg-gray-50 border rounded-lg p-3 overflow-auto h-[360px]">
                {pretty || "No response yet."}
              </pre>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}