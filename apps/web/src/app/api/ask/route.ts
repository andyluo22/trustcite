import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const backend = process.env.TRUSTCITE_API_URL;
  if (!backend) {
    return NextResponse.json({ error: "Missing TRUSTCITE_API_URL" }, { status: 500 });
  }

  const body = await req.text();
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 30_000);

  try {
    const r = await fetch(`${backend}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    const text = await r.text();
    return new NextResponse(text, {
      status: r.status,
      headers: {
        "Content-Type": r.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (e: any) {
    const msg = e?.name === "AbortError" ? "Backend request timed out" : (e?.message ?? "Proxy error");
    return NextResponse.json({ error: msg }, { status: 502 });
  } finally {
    clearTimeout(t);
  }
}
