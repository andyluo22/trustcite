from __future__ import annotations

import re
from difflib import SequenceMatcher
from typing import Optional, Tuple

_WORD_RE = re.compile(r"[A-Za-z0-9']+")

def _keywords(s: str) -> list[str]:
    words = [w.lower() for w in _WORD_RE.findall(s)]
    # Keep useful words
    words = [w for w in words if len(w) >= 4]
    # de-dup preserving order
    seen = set()
    out = []
    for w in words:
        if w not in seen:
            out.append(w)
            seen.add(w)
    return out[:10]

def align_span(sentence: str, chunk_text: str) -> Optional[Tuple[int, int, float]]:
    """
    Returns (local_start, local_end, score) within chunk_text.
    Score ~[0,1]. Higher = better match.
    """
    s = (sentence or "").strip()
    c = (chunk_text or "")
    if not s or not c:
        return None

    s_low = s.lower()
    c_low = c.lower()

    # 1) Keyword hit region
    keys = _keywords(s)
    hits = []
    for k in keys:
        idx = c_low.find(k)
        if idx != -1:
            hits.append((idx, idx + len(k)))

    if len(hits) >= 2:
        start = min(a for a, _ in hits)
        end = max(b for _, b in hits)
        # Expand slightly to include context
        start = max(0, start - 40)
        end = min(len(c), end + 40)
        # Score using fuzzy ratio on that window
        win = c[start:end]
        score = SequenceMatcher(None, s_low, win.lower()).ratio()
        return (start, end, score)

    # 2) If sentence (or a big fragment) is literally inside chunk
    if len(s_low) >= 20:
        j = c_low.find(s_low[: min(len(s_low), 80)])
        if j != -1:
            start = max(0, j - 20)
            end = min(len(c), j + min(len(s_low), 140))
            win = c[start:end]
            score = SequenceMatcher(None, s_low, win.lower()).ratio()
            return (start, end, score)

    # 3) Fuzzy sliding window fallback (bounded cost)
    # Take a window ~ 1.4x sentence length, scan a few positions
    target_len = max(80, int(len(s) * 1.4))
    if target_len >= len(c):
        score = SequenceMatcher(None, s_low, c_low).ratio()
        return (0, len(c), score)

    best = (0, target_len, 0.0)
    step = max(40, target_len // 6)
    for start in range(0, len(c) - target_len, step):
        end = start + target_len
        win = c_low[start:end]
        sc = SequenceMatcher(None, s_low, win).ratio()
        if sc > best[2]:
            best = (start, end, sc)

    return best