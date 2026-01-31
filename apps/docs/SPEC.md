# TrustCite v1 Spec

## Purpose
Answer questions about a provided document with verifiable grounding.

## Inputs
- document_text: plain text provided by the user
- question: single-turn user question

## Output Contract
- Output is a list of answer sentences.
- Every answer sentence must have >=1 citation to retrieved evidence chunks.
- If the system cannot cite a sentence, it must not output that sentence.
- If no evidence passes the retrieval threshold, the system must abstain.

## Abstention
- abstained=true when retrieval confidence < retrieve_min OR no evidence chunks found.
- When abstaining, answer must be empty or a single sentence explaining insufficient evidence.

## Security (v1)
- Document content is treated as data only and must not override system instructions.
- Queries containing instruction-override patterns are flagged and refused.

## Trace
Always include:
- retrieved chunk_ids + scores
- thresholds (retrieve_min)
- timings_ms (chunk/embed/retrieve/generate)