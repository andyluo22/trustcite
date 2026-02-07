import type { AskResponse } from "./types";

export type AskPayload = { question: string; document_text: string };

export class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function ask(
  payload: AskPayload,
  opts?: { signal?: AbortSignal }
): Promise<AskResponse> {
  const r = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: opts?.signal,
  });

  const text = await r.text();

  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore parse errors (non-json responses)
  }

  if (!r.ok) {
    const msg =
      json?.detail ??
      json?.error ??
      (text ? text.slice(0, 180) : null) ??
      `Request failed (${r.status})`;
    throw new ApiError(msg, r.status, json);
  }

  return json as AskResponse;
}