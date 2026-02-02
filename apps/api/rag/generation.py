from __future__ import annotations

import os
import requests
from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class OllamaConfig:
    base_url: str
    model: str
    timeout_s: int = 120


def load_ollama_config() -> OllamaConfig:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "qwen2.5:7b-instruct")
    return OllamaConfig(base_url=base_url, model=model)


def ollama_generate(prompt: str, *, cfg: Optional[OllamaConfig] = None) -> str:
    """
    Returns the full generated text (non-streaming).
    Raises requests.HTTPError on non-2xx responses.
    """
    cfg = cfg or load_ollama_config()

    r = requests.post(
        f"{cfg.base_url}/api/generate",
        json={
            "model": cfg.model,
            "prompt": prompt,
            "stream": False,
            "keep_alive": "2h",
            # You can tune:
            "options": {
                "temperature": 0.1,
                "top_p": 0.9,
                "num_ctx": 4096,
            },
        },
        timeout=(5, cfg.timeout_s),
    )
    r.raise_for_status()
    data = r.json()
    return (data.get("response") or "").strip()