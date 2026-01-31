# Architecture (v1)

web (Next.js) --> api (FastAPI)
api pipeline:
1) chunk document
2) embed + retrieve top-k
3) generate answer from evidence
4) align citations per sentence
5) abstain if evidence insufficient
return answer + citations + trace