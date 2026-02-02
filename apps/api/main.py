from __future__ import annotations

import time
from typing import Any, Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from rag.embeddings import Embedder
from rag.retrieval import DocIndexCache, retrieve_top_k
from rag.answering import evidence_only_answer, generate_cited_answer


app = FastAPI(title="TrustCite API", version="0.2.0")

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Models ----

class Citation(BaseModel):
    chunk_id: str
    start: int
    end: int

class AnswerSentence(BaseModel):
    sentence: str
    citations: List[Citation] = Field(default_factory=list)

class AskRequest(BaseModel):
    question: str = Field(min_length=1)
    document_text: str = Field(min_length=1)

class RetrievedChunk(BaseModel):
    chunk_id: str
    score: float

class ChunkPreview(BaseModel):
    chunk_id: str
    score: float
    start: int
    end: int
    text: str

class Trace(BaseModel):
    retrieved: List[RetrievedChunk] = Field(default_factory=list)
    chunks_preview: List[ChunkPreview] = Field(default_factory=list)
    thresholds: Dict[str, float] = Field(default_factory=lambda: {"retrieve_min": 0.62})
    timings_ms: Dict[str, int] = Field(default_factory=dict)

class AskResponse(BaseModel):
    answer: List[AnswerSentence]
    abstained: bool
    trace: Trace


# ---- Singletons ----
EMBEDDER = Embedder.load("sentence-transformers/all-MiniLM-L6-v2")
CACHE = DocIndexCache(max_items=8)


@app.get("/health")
def health():
    return {"ok": True, "version": "0.2.0"}


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    t0 = time.perf_counter()

    retrieve_min = 0.62
    top_k = 5

    t_retrieve0 = time.perf_counter()
    retrieved = retrieve_top_k(
        question=req.question,
        document_text=req.document_text,
        embedder=EMBEDDER,
        cache=CACHE,
        k=top_k,
    )
    t_retrieve1 = time.perf_counter()

    trace_retrieved = [
        RetrievedChunk(chunk_id=r.chunk.chunk_id, score=r.score) for r in retrieved
    ]
    trace_preview = [
        ChunkPreview(
            chunk_id=r.chunk.chunk_id,
            score=r.score,
            start=r.chunk.start,
            end=r.chunk.end,
            text=r.chunk.text[:600],  # keep preview light
        )
        for r in retrieved
    ]

    # Abstain if no evidence or low similarity
    if not retrieved or retrieved[0].score < retrieve_min:
        t1 = time.perf_counter()
        return AskResponse(
            answer=[],
            abstained=True,
            trace=Trace(
                retrieved=trace_retrieved,
                chunks_preview=trace_preview,
                thresholds={"retrieve_min": retrieve_min},
                timings_ms={
                    "retrieve": int((t_retrieve1 - t_retrieve0) * 1000),
                    "total": int((t1 - t0) * 1000),
                },
            ),
        )

    # --- Day 3: generator answer (strict citations) ---
    t_gen0 = time.perf_counter()
    try:
        out = generate_cited_answer(req.question, retrieved)
        t_gen1 = time.perf_counter()

        # Special: model says no evidence
        if out.raw_model_text.strip() == "I don't know. [NO_EVIDENCE]":
            t1 = time.perf_counter()
            return AskResponse(
                answer=[],
                abstained=True,
                trace=Trace(
                    retrieved=trace_retrieved,
                    chunks_preview=trace_preview,
                    thresholds={"retrieve_min": retrieve_min},
                    timings_ms={
                        "retrieve": int((t_retrieve1 - t_retrieve0) * 1000),
                        "generate": int((t_gen1 - t_gen0) * 1000),
                        "total": int((t1 - t0) * 1000),
                    },
                ),
            )

        # Enforce: if no sentences survived → fallback
        if not out.sentences:
            raise RuntimeError("No citable sentences survived enforcement")

        answer_sentences: List[AnswerSentence] = []
        for sent_text, cits in out.sentences:
            answer_sentences.append(
                AnswerSentence(
                    sentence=sent_text,
                    citations=[
                        Citation(chunk_id=cid, start=s, end=e) for (cid, s, e) in cits
                    ],
                )
            )

        t1 = time.perf_counter()
        return AskResponse(
            answer=answer_sentences,
            abstained=False,
            trace=Trace(
                retrieved=trace_retrieved,
                chunks_preview=trace_preview,
                thresholds={"retrieve_min": retrieve_min},
                timings_ms={
                    "retrieve": int((t_retrieve1 - t_retrieve0) * 1000),
                    "generate": int((t_gen1 - t_gen0) * 1000),
                    "total": int((t1 - t0) * 1000),
                },
            ),
        )

    except Exception:
        # Fallback: Day-2 evidence-only answer (never break demo)
        top = retrieved[0]
        excerpt, cite_start, cite_end = evidence_only_answer(top)

        t1 = time.perf_counter()
        return AskResponse(
            answer=[
                AnswerSentence(
                    sentence=excerpt,
                    citations=[
                        Citation(
                            chunk_id=top.chunk.chunk_id,
                            start=cite_start,
                            end=cite_end,
                        )
                    ],
                )
            ],
            abstained=False,
            trace=Trace(
                retrieved=trace_retrieved,
                chunks_preview=trace_preview,
                thresholds={"retrieve_min": retrieve_min},
                timings_ms={
                    "retrieve": int((t_retrieve1 - t_retrieve0) * 1000),
                    "total": int((t1 - t0) * 1000),
                },
            ),
        )
