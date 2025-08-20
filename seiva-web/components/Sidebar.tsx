"use client";
import { useChatStore } from "@/components/chat/ChatProvider";

type ChatMsg = { role: "user" | "assistant"; content: unknown };
type EthereumProvider = { request: (args: { method: string }) => Promise<string[]> };
type KeplrKey = { bech32Address: string };
type KeplrProvider = { enable: (chainId: string) => Promise<void>; getKey: (chainId: string) => Promise<KeplrKey> };

// helper pengganti clsx
function cn(...xs: Array<string | undefined | null | false>) {
  return xs.filter(Boolean).join(" ");
}

function short(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}
function deriveTitle(s: { title: string; messages: ChatMsg[] }) {
  if (s.title && s.title !== "New chat") return s.title;
  const firstUser = s.messages?.find((m) => m.role === "user");
  const raw = firstUser?.content;
  const t = typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  return t.length > 40 ? t.slice(0, 37) + "…" : t || "New chat";
}

export default function Sidebar({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const {
    sessions, activeId, setActive, createSession, deleteSession,
    walletAddr, setWalletAddr,
  } = useChatStore();

  async function connectMetaMask() {
    const eth = (globalThis as unknown as { ethereum?: EthereumProvider }).ethereum;
    if (!eth) { window.open("https://metamask.io/download", "_blank"); return; }
    try {
      const accs = await eth.request({ method: "eth_requestAccounts" });
      setWalletAddr(accs?.[0] ?? null);
    } catch {}
  }

  async function connectKeplr() {
    const w = globalThis as unknown as { keplr?: KeplrProvider };
    if (!w?.keplr) { window.open("https://www.keplr.app/download", "_blank"); return; }
    try {
      await w.keplr.enable("pacific-1");
      const key = await w.keplr.getKey("pacific-1");
      setWalletAddr(key?.bech32Address ?? null);
    } catch {}
  }

  return (
    <aside className={cn("h-full w-80 border-r bg-white flex flex-col", className)}>
      {/* ...sisanya tetap... */}
    </aside>
  );
}
