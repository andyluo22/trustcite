from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

from .retrieval import Retrieved
from .chunking import Chunk
from .generation import ollama_generate
from .citations import enforce_citations


def evidence_only_answer(top: Retrieved, max_chars: int = 240) -> Tuple[str, int, int]:
    """
    Returns (answer_text, cite_start, cite_end) using ONLY the top chunk.
    Day 2 fallback.
    """
    txt = top.chunk.text.strip()
    if len(txt) <= max_chars:
        excerpt = txt
        local_start = 0
        local_end = len(txt)
    else:
        excerpt = txt[:max_chars].rsplit(" ", 1)[0] + "…"
        local_start = 0
        local_end = len(excerpt.replace("…", ""))

    cite_start = top.chunk.start + local_start
    cite_end = min(top.chunk.start + local_end, top.chunk.end)
    return excerpt, cite_start, cite_end


@dataclass(frozen=True)
class AnswerOut:
    sentences: List[Tuple[str, List[Tuple[str, int, int]]]]
    raw_model_text: str


def build_cited_prompt(question: str, retrieved: List[Retrieved], *, max_chars_per_chunk: int = 900) -> str:
    header = (
        "You are TrustCite.\n"
        "Answer the question using ONLY the EVIDENCE chunks below.\n"
        "Rules:\n"
        "1) Write 1–3 short sentences.\n"
        "2) EVERY sentence MUST end with citations in brackets using chunk ids, e.g. [c0003] or [c0003, c0007].\n"
        "3) If the evidence does not contain the answer, output exactly: I don't know. [NO_EVIDENCE]\n"
        "4) Do not add facts; prefer wording from the evidence.\n\n"
    )

    evidence_lines = []
    for r in retrieved:
        chunk_text = r.chunk.text.strip()
        if len(chunk_text) > max_chars_per_chunk:
            chunk_text = chunk_text[:max_chars_per_chunk].rsplit(" ", 1)[0] + "…"
        evidence_lines.append(f"{r.chunk.chunk_id}:\n{chunk_text}\n")

    return header + "EVIDENCE:\n" + "\n".join(evidence_lines) + f"\nQUESTION:\n{question}\n\nANSWER:\n"


def generate_cited_answer(question: str, retrieved: List[Retrieved]) -> AnswerOut:
    prompt = build_cited_prompt(question, retrieved)
    raw = ollama_generate(prompt)

    chunks_by_id: Dict[str, Chunk] = {r.chunk.chunk_id: r.chunk for r in retrieved}
    enforced = enforce_citations(raw, chunks_by_id=chunks_by_id)

    return AnswerOut(sentences=enforced, raw_model_text=raw)
