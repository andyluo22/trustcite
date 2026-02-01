from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple
import hashlib
import numpy as np

from .chunking import Chunk, chunk_document
from .embeddings import Embedder


@dataclass(frozen=True)
class Retrieved:
    chunk: Chunk
    score: float  # cosine similarity in [-1,1], usually [0,1] in practice


class DocIndexCache:
    """
    Cache doc chunking + embeddings by hash(document_text).
    Keeps only a few entries to avoid memory growth.
    """
    def __init__(self, max_items: int = 8):
        self.max_items = max_items
        self._store: Dict[str, Tuple[List[Chunk], np.ndarray]] = {}

    def _key(self, document_text: str) -> str:
        return hashlib.sha256(document_text.encode("utf-8")).hexdigest()

    def get_or_build(self, document_text: str, embedder: Embedder) -> Tuple[List[Chunk], np.ndarray]:
        key = self._key(document_text)
        if key in self._store:
            return self._store[key]

        chunks = chunk_document(document_text)
        mat = embedder.embed_texts([c.text for c in chunks])

        # simple eviction: pop first inserted (good enough for day 2)
        if len(self._store) >= self.max_items:
            oldest_key = next(iter(self._store.keys()))
            self._store.pop(oldest_key, None)

        self._store[key] = (chunks, mat)
        return chunks, mat


def retrieve_top_k(
    *,
    question: str,
    document_text: str,
    embedder: Embedder,
    cache: DocIndexCache,
    k: int = 5,
) -> List[Retrieved]:
    chunks, mat = cache.get_or_build(document_text, embedder)
    if len(chunks) == 0 or mat.shape[0] == 0:
        return []

    q = embedder.embed_query(question)  # (d,)
    scores = mat @ q  # (n,) because normalized -> cosine similarity

    if k <= 0:
        k = 1
    k = min(k, len(chunks))

    top_idx = np.argpartition(-scores, kth=k - 1)[:k]
    top_idx_sorted = top_idx[np.argsort(-scores[top_idx])]

    out: List[Retrieved] = []
    for i in top_idx_sorted:
        out.append(Retrieved(chunk=chunks[int(i)], score=float(scores[int(i)])))
    return out
