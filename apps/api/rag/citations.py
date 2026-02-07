from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Dict, List, Tuple

from .chunking import Chunk


_BRACKET_RE = re.compile(r"\[([^\]]+)\]")
_SENT_SPLIT_RE = re.compile(r"(?<=[.!?])\s+|\n+")


@dataclass(frozen=True)
class ParsedSentence:
    sentence: str
    cited_chunk_ids: List[str]


def split_sentences(text: str) -> List[str]:
    parts = [p.strip() for p in _SENT_SPLIT_RE.split(text) if p and p.strip()]
    return parts


def parse_sentence_citations(sentence: str) -> ParsedSentence:
    """
    Extract chunk ids from bracket groups like:
      "... [c0001]" or "... [c0001, c0002]"
    """
    cited: List[str] = []
    for m in _BRACKET_RE.finditer(sentence):
        inside = m.group(1)
        # allow commas/spaces
        for tok in inside.replace(",", " ").split():
            tok = tok.strip()
            if tok:
                cited.append(tok)

    # de-dup but preserve order
    seen = set()
    deduped = []
    for x in cited:
        if x not in seen:
            deduped.append(x)
            seen.add(x)

    # Remove citation brackets from sentence display (optional)
    cleaned = _BRACKET_RE.sub("", sentence).strip()
    cleaned = re.sub(r"\s{2,}", " ", cleaned)

    return ParsedSentence(sentence=cleaned, cited_chunk_ids=deduped)


def enforce_citations(generated_text: str, *, chunks_by_id: Dict[str, Chunk]) -> List[Tuple[str, List[Tuple[str,int,int]]]]:
    """
    Returns list of (sentence_text, citations) where citations are tuples:
      (chunk_id, start, end)
    Sentences without citations are dropped.
    Unknown chunk ids are ignored (and may cause the sentence to be dropped).
    """
    out: List[Tuple[str, List[Tuple[str,int,int]]]] = []

    for sent in split_sentences(generated_text):
        sent = sent.strip()
        # require citations to appear at the end of the sentence
        # e.g. "... blah blah [c0001, c0002]"
        if not re.search(r"\[[^\]]+\]\s*$", sent):
            continue


        parsed = parse_sentence_citations(sent)
        if not parsed.cited_chunk_ids:
            continue

        cits: List[Tuple[str,int,int]] = []
        for cid in parsed.cited_chunk_ids:
            ch = chunks_by_id.get(cid)
            if not ch:
                continue
            # Day 3: cite the whole chunk span (valid + easy)
            cits.append((ch.chunk_id, ch.start, ch.end))

        if not cits:
            continue

        if parsed.sentence:
            out.append((parsed.sentence, cits))

    return out