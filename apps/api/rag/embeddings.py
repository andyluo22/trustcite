from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional
import numpy as np

# SentenceTransformers is CPU-friendly for MiniLM
from sentence_transformers import SentenceTransformer


@dataclass
class Embedder:
    model_name: str
    _model: SentenceTransformer

    @classmethod
    def load(cls, model_name: str = "sentence-transformers/all-MiniLM-L6-v2") -> "Embedder":
        model = SentenceTransformer(model_name)
        return cls(model_name=model_name, _model=model)

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """
        Returns float32 matrix (n, d), L2-normalized for cosine via dot-product.
        """
        if not texts:
            return np.zeros((0, 384), dtype=np.float32)

        vecs = self._model.encode(
            texts,
            batch_size=32,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,  # important: cosine = dot
        )
        return vecs.astype(np.float32)

    def embed_query(self, text: str) -> np.ndarray:
        vec = self._model.encode(
            [text],
            batch_size=1,
            show_progress_bar=False,
            convert_to_numpy=True,
            normalize_embeddings=True,
        )[0]
        return vec.astype(np.float32)
