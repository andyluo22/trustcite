from __future__ import annotations
from dataclasses import dataclass
from typing import List


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    start: int  # char offset in original document_text
    end: int    # char offset (exclusive)
    text: str


def _iter_paragraph_spans(text: str) -> List[tuple[int, int]]:
    """
    Split by blank lines but preserve exact character offsets.
    Paragraph span = [start, end) over original text.
    """
    spans: List[tuple[int, int]] = []
    n = len(text)
    i = 0

    while i < n:
        # skip leading newlines
        while i < n and text[i] in ("\n", "\r"):
            i += 1
        if i >= n:
            break

        start = i
        # paragraph goes until next blank line
        while i < n:
            # detect blank line: '\n\n' (handle Windows '\r\n' too)
            if text[i] == "\n":
                # lookahead for another newline (possibly with \r in between)
                j = i
                # consume one newline
                j += 1
                # optional \r
                if j < n and text[j] == "\r":
                    j += 1
                # second newline?
                if j < n and text[j] == "\n":
                    end = i
                    spans.append((start, end))
                    i = j + 1
                    break
            i += 1
        else:
            # reached end
            spans.append((start, n))
            break

    return spans


def chunk_document(document_text: str, *, max_chars: int = 900, overlap_chars: int = 150) -> List[Chunk]:
    """
    Chunk the document into ~max_chars windows using paragraph spans.
    If a paragraph is huge, we window it with overlap.

    Offsets are always with respect to the original document_text.
    """
    if not document_text or not document_text.strip():
        return []

    chunks: List[Chunk] = []
    spans = _iter_paragraph_spans(document_text)

    buf_start = None
    buf_end = None
    buf_parts: List[str] = []
    chunk_idx = 0

    def flush():
        nonlocal chunk_idx, buf_start, buf_end, buf_parts
        if buf_start is None or buf_end is None:
            return
        text = document_text[buf_start:buf_end]
        if text.strip():
            chunks.append(
                Chunk(
                    chunk_id=f"c{chunk_idx:04d}",
                    start=buf_start,
                    end=buf_end,
                    text=text,
                )
            )
            chunk_idx += 1
        buf_start = None
        buf_end = None
        buf_parts = []

    for (p_start, p_end) in spans:
        para = document_text[p_start:p_end].strip()
        if not para:
            continue

        # If paragraph is too large, cut it into windows
        if (p_end - p_start) > max_chars:
            flush()
            w_start = p_start
            while w_start < p_end:
                w_end = min(p_end, w_start + max_chars)
                # extend end to nearest newline for nicer chunk boundaries if possible
                nl = document_text.rfind("\n", w_start, w_end)
                if nl != -1 and nl > w_start + 200:
                    w_end = nl
                chunks.append(
                    Chunk(
                        chunk_id=f"c{chunk_idx:04d}",
                        start=w_start,
                        end=w_end,
                        text=document_text[w_start:w_end],
                    )
                )
                chunk_idx += 1
                w_start = max(w_end - overlap_chars, w_start + 1)
            continue

        # Otherwise, accumulate paragraphs into a chunk
        if buf_start is None:
            buf_start = p_start
            buf_end = p_end
        else:
            # +2 for blank line (approx), but we use actual offsets so just set buf_end
            tentative_len = (p_end - buf_start)
            if tentative_len > max_chars:
                flush()
                buf_start = p_start
                buf_end = p_end
            else:
                buf_end = p_end

    flush()
    return chunks