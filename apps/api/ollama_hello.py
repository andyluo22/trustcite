import requests

OLLAMA = "http://localhost:11434"

r = requests.post(
    f"{OLLAMA}/api/generate",
    json={
        "model": "qwen2.5:7b-instruct",
        "prompt": "Say READY and nothing else.",
        "stream": False,
        "keep_alive": "2h",
    },
    timeout=(5, 600),
)
r.raise_for_status()
print(r.json()["response"])