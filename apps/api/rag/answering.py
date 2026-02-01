from __future__ import annotations
from typing import Tuple

from .retrieval import Retrieved


def evidence_only_answer(top: Retrieved, max_chars: int = 240) -> Tuple[str, int, int]:
    """
    Returns (answer_text, cite_start, cite_end) using ONLY the top chunk.
    This is deliberately conservative for Day 2.
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

    # map local span back to original document offsets
    cite_start = top.chunk.start + local_start
    cite_end = min(top.chunk.start + local_end, top.chunk.end)
    return excerpt, cite_start, cite_end
