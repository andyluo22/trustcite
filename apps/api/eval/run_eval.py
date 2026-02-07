from __future__ import annotations

import json
import time
from dataclasses import dataclass
from typing import Any, Dict, List

import requests


@dataclass
class CaseResult:
    id: str
    ok: bool
    checks: Dict[str, bool]
    details: Dict[str, Any]


def _has_all(text: str, needles: List[str]) -> bool:
    t = text.lower()
    return all(n.lower() in t for n in needles)


def _all_sentences_have_citations(resp: Dict[str, Any]) -> bool:
    answer = resp.get("answer", [])
    if not isinstance(answer, list):
        return False

    for s in answer:
        if not isinstance(s, dict):
            return False
        cits = s.get("citations", [])
        if not isinstance(cits, list) or len(cits) == 0:
            return False

        for c in cits:
            if not isinstance(c, dict):
                return False
            if not all(k in c for k in ("chunk_id", "start", "end")):
                return False
            if not isinstance(c["start"], int) or not isinstance(c["end"], int):
                return False
            if c["end"] <= c["start"]:
                return False

    return True


def main() -> None:
    with open("apps/api/eval/golden.json", "r", encoding="utf-8") as f:
        golden = json.load(f)

    url = "http://127.0.0.1:8000/ask"
    doc_text = golden["document_text"]
    cases = golden["cases"]

    results: List[CaseResult] = []
    started = time.time()

    for case in cases:
        payload = {"question": case["question"], "document_text": doc_text}

        t0 = time.time()
        r = requests.post(url, json=payload, timeout=120)
        latency_ms = int((time.time() - t0) * 1000)

        ok_http = r.status_code == 200
        resp = r.json() if ok_http else {}

        abstained = bool(resp.get("abstained", False))
        answer_text = " ".join([x.get("sentence", "") for x in resp.get("answer", [])]).strip()

        checks = {
            "http_200": ok_http,
            "abstain_correct": (abstained == bool(case["must_abstain"])),
            "must_contain": (True if abstained else _has_all(answer_text, case["must_contain"])),
            "citations_present": (True if abstained else _all_sentences_have_citations(resp)),
            "timings_present": isinstance(resp.get("trace", {}).get("timings_ms", None), dict),
        }

        ok = all(checks.values())

        results.append(
            CaseResult(
                id=case["id"],
                ok=ok,
                checks=checks,
                details={
                    "latency_ms": latency_ms,
                    "abstained": abstained,
                    "answer_preview": answer_text[:240],
                    "sanitized": resp.get("trace", {}).get("sanitized", {}),
                },
            )
        )

    total_ms = int((time.time() - started) * 1000)
    passed = sum(1 for x in results if x.ok)

    report = {
        "passed": passed,
        "total": len(results),
        "total_ms": total_ms,
        "cases": [
            {"id": x.id, "ok": x.ok, "checks": x.checks, "details": x.details}
            for x in results
        ],
    }

    out_path = "apps/api/eval/report.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"[eval] passed {passed}/{len(results)} in {total_ms} ms")
    print(f"[eval] wrote {out_path}")


if __name__ == "__main__":
    main()