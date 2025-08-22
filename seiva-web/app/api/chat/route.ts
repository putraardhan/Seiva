// app/api/chat/route.ts
import { NextResponse } from "next/server";

// Pakai ENV kalau diset, kalau tidak fallback ke production URL yang kamu kasih
const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ??
  "https://seiva45.app.n8n.cloud/webhook/b771261a-300a-433b-8410-ce334b523b40";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Timeout guard (30s)
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30_000);

    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(t));

    const raw = await upstream.text();

    if (!upstream.ok) {
      // teruskan error dari n8n biar gampang debug
      return NextResponse.json(
        { error: "n8n error", status: upstream.status, body: raw },
        { status: 502 }
      );
    }

    // Normalisasi respons n8n: { reply, buttons? }
    let data: any;
    try { data = JSON.parse(raw); } catch { data = { reply: raw }; }

    const reply =
      data?.reply ?? data?.message ?? data?.text ?? "Maaf, ada gangguan. Coba lagi ya.";
    const buttons = data?.buttons;

    return NextResponse.json({ reply, ...(buttons ? { buttons } : {}) });
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return NextResponse.json({ error: "Upstream timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Server error", detail: String(err?.message ?? err) }, { status: 500 });
  }
}

// Health check sederhana
export async function GET() {
  return NextResponse.json({ ok: true, target: WEBHOOK_URL ? "configured" : "missing" });
}
