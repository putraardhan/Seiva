// app/api/chat/route.ts
import { NextResponse } from "next/server";

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ??
  "https://seiva45.app.n8n.cloud/webhook/b771261a-300a-433b-8410-ce334b523b40";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type N8nResponse = {
  reply?: string;
  message?: string;
  text?: string;
  buttons?: unknown;
  [k: string]: unknown;
};

export async function POST(req: Request) {
  try {
    const { message, sessionId } = (await req.json()) as { message?: string; sessionId?: string };
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

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
      return NextResponse.json(
        { error: "n8n error", status: upstream.status, body: raw },
        { status: 502 }
      );
    }

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    let reply = "Maaf, ada gangguan. Coba lagi ya.";
    let buttons: unknown;

    if (typeof data === "string") {
      reply = data;
    } else if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      reply =
        (typeof d.reply === "string" && d.reply) ||
        (typeof d.message === "string" && d.message) ||
        (typeof d.text === "string" && d.text) ||
        reply;
      buttons = d.buttons;
    }

    return NextResponse.json({ reply
