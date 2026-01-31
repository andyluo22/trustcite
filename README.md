# TrustCite

Trustworthy long-document QA with per-sentence citations, abstention, and retrieval trace.

## Run (local)
### API
cd apps/api
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

### Web
cd apps/web
npm install
npm run dev

Open http://localhost:3000