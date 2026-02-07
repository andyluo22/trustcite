export type Citation = { chunk_id: string; start: number; end: number };

export type AnswerSentence = { sentence: string; citations: Citation[] };

export type RetrievedChunk = { chunk_id: string; score: number };

export type ChunkPreview = {
  chunk_id: string;
  score: number;
  start: number;
  end: number;
  text: string;
};

export type Trace = {
  retrieved: RetrievedChunk[];
  chunks_preview: ChunkPreview[];
  thresholds: Record<string, number>;
  timings_ms: Record<string, number>;

  fallback_used: boolean;
  dropped_sentences: number;
  verification_scores: number[];
  sanitized: { question: boolean; document: boolean };
};


export type AskResponse = {
  answer: AnswerSentence[];
  abstained: boolean;
  trace: Trace;
};