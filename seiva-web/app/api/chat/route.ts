import { NextResponse } from "next/server";

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ??
  "https://seiva45.app.n8n.cloud/webhook/b771261a-300a-433b-8410-ce334b523b40";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { message?: string; sessionId?: string };

export async function POST(req: Request) {
  try {
    const { message, sessionId } = (await req.json()) as Payload;
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const r = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      cache: "no-store",
    });

    const raw = await r.text();

    if (!r.ok) {
      return NextResponse.json(
        { error: "n8n error", status: r.status, body: raw },
        { status: 502 }
      );
    }

    // Normalisasi respons dari n8n
    let reply = raw;
    try {
      const data = JSON.parse(raw) as unknown;
      if (typeof data === "string") {
        reply = data;
      } else if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        reply =
          (typeof obj.reply === "string" && obj.reply) ||
          (typeof obj.message === "string" && obj.message) ||
          (typeof obj.text === "string" && obj.text) ||
          raw;
      }
    } catch {
      // raw bukan JSON → pakai apa adanya
    }

    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    target: WEBHOOK_URL ? "configured" : "missing",
  });
}
