from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ask_smoke_shape():
    doc = "Vancouver is a coastal city in British Columbia. It is known for its film industry."
    r = client.post("/ask", json={"question": "What is Vancouver known for?", "document_text": doc})
    assert r.status_code == 200
    data = r.json()
    assert "abstained" in data
    assert "trace" in data
    assert isinstance(data["answer"], list)
    t = data["trace"]
    assert "retrieved" in t and "chunks_preview" in t
    assert "timings_ms" in t and "thresholds" in t