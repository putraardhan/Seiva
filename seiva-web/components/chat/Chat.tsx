"use client";

import { useEffect, useRef, useState } from "react";
import { Message, useChatStore } from "./ChatProvider";

const ACCENT = "#DB3975";

export function Chat() {
  const { activeId, activeSession, addMessage, updateSessionTitle } = useChatStore();
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  function isNearBottom(el: HTMLElement, px = 80) {
    return el.scrollHeight - el.scrollTop - el.clientHeight < px;
  }
  function scrollToBottom(smooth = true) {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }

  useEffect(() => {
    const el = listRef.current;
    if (el && isNearBottom(el)) scrollToBottom(true);
  }, [activeSession?.messages]);

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  async function sendMessage() {
    const text = input.trim();
    if (!text || !activeId) return;

    const firstOfSession = !activeSession?.messages?.length;
    if (firstOfSession) {
      window.dispatchEvent(new CustomEvent("seiva:first-message"));
    }

    // set judul dari pesan pertama
    if (firstOfSession) {
      const title = text.length > 40 ? text.slice(0, 37) + "…" : text;
      updateSessionTitle(activeId, title || "New chat");
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text, ts: Date.now() };
    addMessage(activeId, userMsg);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: activeId }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      const reply = data?.reply || data?.error || "Sorry, something went wrong. Please try again.";
      const botMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: reply, ts: Date.now() };
      addMessage(activeId, botMsg);
    } catch {
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
        ts: Date.now(),
      };
      addMessage(activeId, botMsg);
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 sm:space-y-6 pt-2 pb-40">
        {!activeSession?.messages?.length && (
          <div className="rounded-2xl border bg-white p-4 text-center text-sm text-neutral-500">
            Start a conversation about Sei anytime.
          </div>
        )}

        {activeSession?.messages?.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] sm:max-w-[80%] rounded-2xl border px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                m.role === "user" ? "" : "bg-white"
              }`}
              style={
                m.role === "user"
                  ? { backgroundColor: `${ACCENT}1A`, borderColor: `${ACCENT}4D` }
                  : {}
              }
            >
              <div className="mb-1 text-xs font-medium text-neutral-500">
                {m.role === "user" ? "You" : "Seiva"}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-4 z-10 mx-auto w-full max-w-3xl px-3 sm:px-4">
        <div className="rounded-2xl border bg-white/95 backdrop-blur p-2 shadow-xl">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask anything about SEI"
              rows={1}
              className="min-h-[48px] w-full resize-none rounded-xl border px-3 py-3 text-sm outline-none focus:ring-2"
            />
            <button
              onClick={sendMessage}
              className="h-[48px] shrink-0 rounded-xl border px-4 text-sm font-medium hover:bg-neutral-50"
              style={{ borderColor: `${ACCENT}33` }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
