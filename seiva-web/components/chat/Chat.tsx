export function Chat() {
  const { sessions, activeId, addMessage, renameActiveIfEmpty } = useChatStore();
  const active = useMemo(() => sessions.find(s => s.id === activeId) ?? null, [sessions, activeId]);
  const messages = active?.messages ?? [];
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeId]);

  function linkifyText(text: string) {
    const parts: React.ReactNode[] = [];
    const re = /<?((?:https?:\/\/)?(?:t\.me|telegram\.me|[a-z0-9.-]+\.[a-z]{2,})(?:\/[^\s<>]*)?)>?/gi;
    let last = 0; let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      let href = m[1]; if (!/^https?:\/\//i.test(href)) href = "https://" + href;
      parts.push(<a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700">{m[1]}</a>);
      last = re.lastIndex;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  }

  async function sendMessage() {
    if (!active) return;
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (messages.length === 0) window.dispatchEvent(new CustomEvent("seiva:first-message"));

    const now = Date.now();
    addMessage(active.id, { id: crypto.randomUUID(), role: "user", content: text, ts: now });
    // jadikan pesan pertama sebagai judul
    renameActiveIfEmpty(text);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: active.id }),
      });
      const data = await res.json();
      const reply = data?.reply ?? "Sorry, something went wrong. Please try again.";
      addMessage(active.id, { id: crypto.randomUUID(), role: "assistant", content: reply, ts: Date.now() });
    } catch {
      addMessage(active.id, { id: crypto.randomUUID(), role: "assistant", content: "⚠️ Gagal menghubungi server.", ts: Date.now() });
    }
  }

  return (
    <div className="relative flex h-full flex-col">
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-6 pt-2 pb-40">
        {!messages.length && (
          <div className="rounded-2xl border bg-white p-4 text-center text-sm text-neutral-500">
            Start a conversation about crypto anytime.
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl border px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                m.role === "user" ? "" : "bg-white"
              }`}
              style={m.role === "user" ? { backgroundColor: `${ACCENT}1A`, borderColor: `${ACCENT}4D` } : {}}
            >
              <div className="mb-1 text-xs font-medium text-neutral-500">
                {m.role === "user" ? "You" : "Seiva"}
              </div>
              <div className="whitespace-pre-wrap">{linkifyText(m.content)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 z-10 mx-auto w-full max-w-3xl px-4">
        <div className="rounded-2xl border bg-white/95 backdrop-blur p-2 shadow-xl">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything about SEI"
              rows={1}
              className="min-h-[48px] w-full resize-none rounded-xl border px-3 py-3 text-sm outline-none"
            />
            <button onClick={sendMessage} className="h-[48px] shrink-0 rounded-xl border px-4 text-sm font-medium hover:bg-neutral-50">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
