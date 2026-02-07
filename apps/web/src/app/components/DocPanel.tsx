"use client";

import { useMemo, useState } from "react";
import type { SavedDoc } from "../lib/storage";
import { GlassCard } from "./GlassCard";
import { Button } from "./Button";
import { Badge } from "./Badge";

export function DocPanel(props: {
  docs: SavedDoc[];
  selectedDocId: string | null;
  documentText: string;
  editMode: boolean;
  setEditMode: (v: boolean) => void;

  onChangeDocumentText: (t: string) => void;
  onSaveNewDoc: (title: string) => void;
  onSelectDoc: (id: string) => void;
  onDeleteSelected: () => void;
  onLoadDemo: () => void;
}) {
  const [title, setTitle] = useState("Demo doc");

  const selectedTitle = useMemo(() => {
    const d = props.docs.find((x) => x.id === props.selectedDocId);
    return d?.title ?? "none";
  }, [props.docs, props.selectedDocId]);

  const charCount = props.documentText.length;
  const docCount = props.docs.length;

  return (
    <GlassCard
      title="Document"
      subtitle="Manage sources and edit the active document."
      right={
        <div className="flex items-center gap-2">
          <Badge variant={props.editMode ? "info" : "default"}>
            {props.editMode ? "Editing" : "Viewer"}
          </Badge>
          <Badge variant="default">{charCount.toLocaleString()} chars</Badge>
        </div>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={props.editMode ? "secondary" : "primary"}
            size="sm"
            onClick={() => props.setEditMode(!props.editMode)}
          >
            {props.editMode ? "Switch to Viewer" : "Edit Document"}
          </Button>

          <Button variant="secondary" size="sm" onClick={props.onLoadDemo}>
            Load demo
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/55">
          <span>
            Saved:{" "}
            <span className="text-white/80 font-medium">{docCount}</span>
          </span>
          <span className="text-white/30">•</span>
          <span>
            Selected:{" "}
            <span className="text-white/80 font-medium">{selectedTitle}</span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-white/10" />

      {/* Save new doc */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="relative">
          <input
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35
                      focus:outline-none focus:ring-2 focus:ring-white/15"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title to save this document"
          />
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/35">
            ⌘⏎
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => props.onSaveNewDoc(title.trim() || "Untitled")}
          disabled={!title.trim()}
          className="h-11"
        >
          Save
        </Button>
      </div>

      {/* Select/delete */}
      <div className="mt-3">
        {props.docs.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white
                          focus:outline-none focus:ring-2 focus:ring-white/15"
                value={props.selectedDocId ?? ""}
                onChange={(e) => props.onSelectDoc(e.target.value)}
              >
                {props.docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45">
                ▾
              </div>
            </div>

            <Button
              variant="danger"
              onClick={props.onDeleteSelected}
              disabled={!props.selectedDocId}
              className="h-11"
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60">
            No saved docs yet. Paste/edit a doc, then hit <span className="text-white/80 font-medium">Save</span>.
          </div>
        )}
      </div>

      {/* Editor */}
      {props.editMode && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-xs font-semibold tracking-wide text-white/70">
              Editor
            </div>
            <div className="text-xs text-white/45">
              Tip: keep docs structured (headings, short paragraphs)
            </div>
          </div>

          <textarea
            value={props.documentText}
            onChange={(e) => props.onChangeDocumentText(e.target.value)}
            className="w-full h-[420px] rounded-2xl bg-black/35 border border-white/10 p-4 text-sm text-white/85
                      font-mono leading-relaxed placeholder:text-white/35
                      focus:outline-none focus:ring-2 focus:ring-white/15"
            placeholder="Paste your document here…"
          />
        </div>
      )}
    </GlassCard>
  );
}
