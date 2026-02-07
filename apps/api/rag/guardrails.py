from __future__ import annotations

import re
from dataclasses import dataclass

# Extremely simple, effective Day-4 guardrails.
# (We can make it fancier later with classifiers, but this already blocks common prompt injection patterns.)

_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(the\s+)?previous\s+instructions",
    r"disregard\s+all\s+prior",
    r"system\s+prompt",
    r"developer\s+message",
    r"you\s+are\s+chatgpt",
    r"do\s+anything\s+now",
    r"jailbreak",
    r"follow\s+these\s+instructions",
]


_PAT_RE = re.compile("|".join(f"({p})" for p in _INJECTION_PATTERNS), flags=re.IGNORECASE)

def looks_like_prompt_injection(text: str) -> bool:
    t = text.lower()
    needles = [
        "ignore previous instructions",
        "system prompt",
        "developer message",
        "you are chatgpt",
        "do anything now",
    ]
    return any(n in t for n in needles)

@dataclass(frozen=True)
class Sanitized:
    text: str
    changed: bool


def sanitize_question(q: str) -> Sanitized:
    original = q or ""
    cleaned = original.strip()

    # If the question starts with injection-y stuff, REMOVE it entirely (don’t replace with tokens).
    # This is the key fix that makes your IGNORE test pass.
    cleaned2 = _PAT_RE.sub("", cleaned)

    # Cleanup leftover punctuation/extra spaces created by deletions
    cleaned2 = re.sub(r"\s{2,}", " ", cleaned2).strip()
    cleaned2 = re.sub(r"^[\.\-:;,\s]+", "", cleaned2).strip()

    # If it's wildly long, it's suspicious and hurts retrieval
    if len(cleaned2) > 500:
        cleaned2 = cleaned2[:500].rsplit(" ", 1)[0] + "…"

    # If we nuked too much and ended empty, fall back to original stripped
    if not cleaned2:
        cleaned2 = cleaned

    return Sanitized(text=cleaned2, changed=(cleaned2 != cleaned))


def sanitize_document(doc: str, *, max_chars: int = 120_000) -> Sanitized:
    original = doc or ""
    cleaned = original

    # Clamp size (keeps embed + UI responsive)
    if len(cleaned) > max_chars:
        cleaned = cleaned[:max_chars]

    # Don't remove content aggressively (you still want fidelity),
    # but neutralize direct instruction-y patterns.
    cleaned2 = _PAT_RE.sub("[INJECTION_TEXT_REDACTED]", cleaned)

    return Sanitized(text=cleaned2, changed=(cleaned2 != original))
