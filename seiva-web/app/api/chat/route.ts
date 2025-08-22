import { NextResponse } from "next/server";

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL; // ← ambil dari ENV saja (tanpa fallback)

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { message?: string; sessionId?: string };

function missingEnvResponse() {
  return NextResponse.json(
    { error: "Server misconfigured: N8N_WEBHOOK_URL is not set" },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  if (!WEBHOOK_URL) return missingEnvResponse();

  try {
    const { message, sessionId } = (await req.json()) as Payload;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Timeout fetch biar gak nunggu lama kalau n8n lambat/ down
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000); // 20s

    const r = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const raw = await r.text();

    if (!r.ok) {
      // forward info error dari n8n, tapi tetap 502 agar jelas upstream error
      return NextResponse.json(
        { error: "n8n error", status: r.status, body: raw || null },
        { status: 502 }
      );
    }

    // Normalisasi respons dari n8n: string | { reply | message | text }
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
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}

export async function GET() {
  if (!WEBHOOK_URL) return missingEnvResponse();

  // Masking id webhook agar tidak bocor di response
  const masked =
    WEBHOOK_URL.replace(/^https?:\/\//, "")
      .replace(/\/webhook\/.*/, "/webhook/…");

  return NextResponse.json({ ok: true, target: masked });
}
