from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple

from .chunking import Chunk
from .span_align import align_span

@dataclass(frozen=True)
class VerifiedCitation:
    chunk_id: str
    start: int
    end: int
    score: float

@dataclass(frozen=True)
class VerifiedSentence:
    sentence: str
    citations: List[VerifiedCitation]
    best_score: float

def verify_sentence(
    sentence: str,
    cited_chunk_ids: List[str],
    *,
    chunks_by_id: Dict[str, Chunk],
    min_score: float = 0.40,
) -> VerifiedSentence | None:
    """
    Returns VerifiedSentence with tight spans if supported,
    else None (drop sentence).
    """
    verified: List[VerifiedCitation] = []
    best = 0.0

    for cid in cited_chunk_ids:
        ch = chunks_by_id.get(cid)
        if not ch:
            continue

        res = align_span(sentence, ch.text)
        if not res:
            continue

        local_s, local_e, sc = res
        if sc > best:
            best = sc

        if sc >= min_score:
            verified.append(
                VerifiedCitation(
                    chunk_id=cid,
                    start=ch.start + local_s,
                    end=ch.start + local_e,
                    score=sc,
                )
            )

    if not verified:
        return None

    return VerifiedSentence(sentence=sentence, citations=verified, best_score=best)

def verify_all(
    enforced: List[Tuple[str, List[Tuple[str, int, int]]]],
    *,
    chunks_by_id: Dict[str, Chunk],
    min_score: float = 0.40,
) -> Tuple[List[VerifiedSentence], int]:
    """
    Input: Day-3 enforced format: [(sentence_text, [(chunk_id,start,end), ...]), ...]
    Output: verified sentences with tight spans + count dropped
    """
    out: List[VerifiedSentence] = []
    dropped = 0

    for sent_text, cits in enforced:
        cited_ids = [cid for (cid, _, _) in cits]
        vs = verify_sentence(sent_text, cited_ids, chunks_by_id=chunks_by_id, min_score=min_score)
        if vs is None:
            dropped += 1
            continue
        out.append(vs)

    return out, dropped