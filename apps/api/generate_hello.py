from rag.embeddings import Embedder
from rag.retrieval import DocIndexCache, retrieve_top_k
from rag.answering import generate_cited_answer

doc = (
    "Vancouver is a coastal city in British Columbia. It is known for its film industry.\n\n"
    "Toronto is the largest city in Canada by population.\n\n"
    "Montreal is known for its culture and festivals."
)

q = "What is Vancouver known for?"

embedder = Embedder.load("sentence-transformers/all-MiniLM-L6-v2")
cache = DocIndexCache()

hits = retrieve_top_k(question=q, document_text=doc, embedder=embedder, cache=cache, k=3)
out = generate_cited_answer(q, hits)

print("RAW:\n", out.raw_model_text)
print("\nENFORCED:")
for s, cits in out.sentences:
    print("-", s, cits)