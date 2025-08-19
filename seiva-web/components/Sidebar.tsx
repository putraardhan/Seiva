"use client";
import { useChatStore } from "@/components/chat/ChatProvider";

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function deriveTitle(s: { title: string; messages: any[] }) {
  if (s.title && s.title !== "New chat") return s.title;
  const firstUser = s.messages?.find((m: any) => m.role === "user");
  if (!firstUser) return "New chat";
  const t = String(firstUser.content || "").trim().replace(/\s+/g, " ");
  return t.length > 40 ? t.slice(0, 37) + "…" : t || "New chat";
}

export default function Sidebar() {
  const {
    sessions, activeId, setActive, createSession, deleteSession,
    walletAddr, setWalletAddr,
  } = useChatStore();

  async function connectMetaMask() {
    const eth = (globalThis as any).ethereum;
    if (!eth) { window.open("https://metamask.io/download", "_blank"); return; }
    try {
      const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
      setWalletAddr(accs?.[0] ?? null);
    } catch {}
  }

  async function connectKeplr() {
    const w = globalThis as any;
    if (!w?.keplr) { window.open("https://www.keplr.app/download", "_blank"); return; }
    try {
      await w.keplr.enable("pacific-1");
      const key = await w.keplr.getKey("pacific-1");
      setWalletAddr(key?.bech32Address ?? null);
    } catch {}
  }

  return (
    <aside className="w-80 fixed left-0 top-0 h-screen border-r bg-white z-10 flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <div className="font-semibold">Chat history</div>
        <button
          onClick={() => createSession()}
          className="text-sm rounded border px-2 py-1 hover:bg-neutral-50"
        >
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-auto px-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`group flex items-center justify-between gap-2 px-3 py-2 rounded cursor-pointer ${
              s.id === activeId ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
            onClick={() => setActive(s.id)}
            title={new Date(s.updatedAt).toLocaleString()}
          >
            <div className="truncate text-sm">{deriveTitle(s)}</div>
            <button
              onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
              className="opacity-0 group-hover:opacity-100 text-xs text-red-600"
              aria-label="Delete"
            >
              ×
            </button>
          </div>
        ))}
        {!sessions.length && (
          <div className="text-sm text-neutral-500 px-3 py-2">No chats yet</div>
        )}
      </div>

      {/* Wallet connect */}
      <div className="px-3 py-2 border-t space-y-2">
        <div className="text-xs font-medium text-neutral-600">Login with wallet</div>
        {walletAddr ? (
          <div className="text-sm">
            Connected: <span className="font-mono">{short(walletAddr)}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={connectMetaMask}
              className="text-xs rounded border px-2 py-1 hover:bg-neutral-50"
            >
              MetaMask
            </button>
            <button
              onClick={connectKeplr}
              className="text-xs rounded border px-2 py-1 hover:bg-neutral-50"
            >
              Keplr
            </button>
          </div>
        )}
      </div>

      {/* Social buttons */}
      <div className="px-3 py-3 border-t flex gap-2">
        <a
          href="https://t.me/sei_vabot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm rounded border px-3 py-2 hover:bg-neutral-50"
        >
          Telegram
        </a>
        <a
          href="https://twitter.com/seiva_assistant"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-sm rounded border px-3 py-2 hover:bg-neutral-50"
        >
          Twitter
        </a>
      </div>
    </aside>
  );
}
