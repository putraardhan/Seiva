import { NextResponse } from "next/server";

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ??
  "https://seiva45.app.n8n.cloud/webhook/b771261a-300a-433b-8410-ce334b523b40";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = { message?: string; sessionId?: string };
type Buttons = unknown;
type UpstreamObj = {
  reply?: unknown;
  message?: unknown;
  text?: unknown;
  buttons?: Buttons;
} & Record<string, unknown>;

export async function POST(req: Request) {
  try {
    const { message, sessionId } = (await req.json()) as Payload;
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30_000);

    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeoutId));

    const raw = await upstream.text();

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "n8n error", status: upstream.status, body: raw },
        { status: 502 }
      );
    }

    let reply = "Maaf, ada gangguan. Coba lagi ya.";
    let buttons: Buttons | undefined;

    try {
      const data = JSON.parse(raw) as unknown;
      if (typeof data === "string") {
        reply = data;
      } else if (data &&
