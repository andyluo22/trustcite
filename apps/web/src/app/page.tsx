"use client";

import { useEffect, useMemo, useState, useRef } from "react";

import { DocPanel } from "./components/DocPanel";
import { DocViewer } from "./components/DocViewer";
import { AskPanel } from "./components/AskPanel";
import { AnswerPanel } from "./components/AnswerPanel";
import { InspectRunPanel } from "./components/InspectRunPanel";
import { Background } from "./components/Background";

import { ask } from "./lib/api";
import type { AskResponse, Citation } from "./lib/types";
import { loadDocs, saveDocs, type SavedDoc } from "./lib/storage";

function demoDocText() {
  return (
    `TrustCite Demo Doc\n\n` +
    `This system answers questions only using the provided document.\n` +
    `If it cannot find evidence, it will abstain.\n\n` +
    `Vancouver is a coastal city in British Columbia. It is known for its film industry.\n\n` +
    `This is a tiny demo doc for Day 5.`
  );
}

function makeId() {
  // Works in modern browsers; fallback keeps you safe.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `doc_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function Home() {
  // --- Document store (localStorage) ---
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // This is the *active* document text you send to backend.
  const [documentText, setDocumentText] = useState<string>(demoDocText());

  // UI mode: Edit (textarea) vs Viewer (highlight span)
  const [editMode, setEditMode] = useState<boolean>(true);

  // --- Asking ---
  const [question, setQuestion] = useState("What is Vancouver known for?");
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<AskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active citation to highlight in viewer
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  // cancels network requests currently in flight
  const abortRef = useRef<AbortController | null>(null);

  // Load docs on mount
  useEffect(() => {
    const loaded = loadDocs();
    setDocs(loaded);

    if (loaded.length > 0) {
      setSelectedDocId(loaded[0].id);
      setDocumentText(loaded[0].text);
      setEditMode(false); // nice UX: if you have docs, start in viewer mode
    } else {
      setSelectedDocId(null);
      setDocumentText(demoDocText());
    }
  }, []);

  // Persist docs whenever docs changes
  useEffect(() => {
    // Only persist after initial mount (docs state exists anyway, safe to always call)
    saveDocs(docs);
  }, [docs]);

  const selectedTitle = useMemo(() => {
    const d = docs.find((x) => x.id === selectedDocId);
    return d?.title ?? "none";
  }, [docs, selectedDocId]);

  // --- Handlers ---
  function onLoadDemo() {
    setDocumentText(demoDocText());
    setSelectedDocId(null);
    setActiveCitation(null);
    setResp(null);
    setError(null);
    setEditMode(true);
  }

  function onSaveNewDoc(title: string) {
    const t = (title ?? "").trim() || "Untitled doc";
    const newDoc: SavedDoc = {
      id: makeId(),
      title: t,
      text: documentText,
      createdAt: Date.now(),
    };

    setDocs((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc.id);
    setEditMode(false);
  }

  function onSelectDoc(id: string) {
    const d = docs.find((x) => x.id === id);
    if (!d) return;

    setSelectedDocId(d.id);
    setDocumentText(d.text);
    setActiveCitation(null);
    setResp(null);
    setError(null);
    setEditMode(false);
  }

  function onDeleteSelected() {
    if (!selectedDocId) return;

    setDocs((prev) => prev.filter((d) => d.id !== selectedDocId));

    // After deletion: select next available doc, else revert to demo
    const remaining = docs.filter((d) => d.id !== selectedDocId);
    if (remaining.length > 0) {
      setSelectedDocId(remaining[0].id);
      setDocumentText(remaining[0].text);
      setEditMode(false);
    } else {
      setSelectedDocId(null);
      setDocumentText(demoDocText());
      setEditMode(true);
    }

    setActiveCitation(null);
    setResp(null);
    setError(null);
  }

  function onChangeDocumentText(t: string) {
    setDocumentText(t);

    // Optional: if currently viewing a saved doc, keep that doc synced as you edit.
    // This makes "Edit saved doc" behave intuitively.
    if (!selectedDocId) return;
    setDocs((prev) =>
      prev.map((d) => (d.id === selectedDocId ? { ...d, text: t } : d))
    );
  }

  async function onAsk() {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResp(null);
    setActiveCitation(null);

    try {
      const data = await ask({ question, document_text: documentText }, { signal: controller.signal});
      setResp(data);
    } catch (e: any) {
      if (e?.name == "AbortError") return;
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function onPickCitation(c: Citation) {
    setActiveCitation(c);
    // viewer mode makes the highlight "wow"
    setEditMode(false);
  }

  return (
    <main className="min-h-screen bg-transparent text-white">
      <Background />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">TrustCite</h1>
            </div>

            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Trustworthy long-document QA with per-sentence citations, abstain, and trace.
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/55">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                <span>Active doc:</span>
                <span className="text-white/80 font-medium">{selectedTitle}</span>
              </span>

              <span className="text-white/30">•</span>

              <span>
                Mode: <span className="text-white/80 font-medium">{editMode ? "Edit" : "Viewer"}</span>
              </span>
            </div>

          </div>

        </div>

        {/* Main grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* LEFT */}
          <div className="space-y-6">
            <DocPanel
              docs={docs}
              selectedDocId={selectedDocId}
              documentText={documentText}
              editMode={editMode}
              setEditMode={setEditMode}
              onChangeDocumentText={onChangeDocumentText}
              onSaveNewDoc={onSaveNewDoc}
              onSelectDoc={onSelectDoc}
              onDeleteSelected={onDeleteSelected}
              onLoadDemo={onLoadDemo}
            />

            {!editMode && <DocViewer text={documentText} active={activeCitation} />}
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <AskPanel
              question={question}
              setQuestion={setQuestion}
              loading={loading}
              onAsk={onAsk}
            />

            <AnswerPanel
              resp={resp}
              loading={loading}
              error={error}
              onPickCitation={onPickCitation}
            />

            <InspectRunPanel resp={resp} />
          </div>
        </div>

        {/* Footer (tiny, premium) */}
        <div className="mt-10 text-xs text-white/35">
          TrustCite — answers are grounded in the provided document; otherwise the system abstains.
        </div>
      </div>
    </main>
  );

}
