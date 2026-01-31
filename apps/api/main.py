from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any

app = FastAPI(title="TrustCite API", version="0.1.0")

# CORS for local dev (Next.js default port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

class Trace(BaseModel):
    retrieved: List[RetrievedChunk] = Field(default_factory=list)
    thresholds: Dict[str, float] = Field(default_factory=lambda: {"retrieve_min": 0.62})
    timings_ms: Dict[str, int] = Field(default_factory=dict)

class AskResponse(BaseModel):
    answer: List[AnswerSentence]
    abstained: bool
    trace: Trace

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    # Day 1 stub: return correct schema always
    return AskResponse(
        answer=[AnswerSentence(sentence="Stub answer (Day 1).", citations=[])],
        abstained=False,
        trace=Trace(
            retrieved=[],
            thresholds={"retrieve_min": 0.62},
            timings_ms={"generate": 1},
        ),
    )