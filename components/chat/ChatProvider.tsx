"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Message = { id: string; role: "user" | "assistant"; content: string; ts: number };
export type ChatSession = { id: string; title: string; createdAt: number; updatedAt: number; messages: Message[] };

type Store = {
  sessions: ChatSession[];
  activeId: string | null;
  walletAddr?: string | null;
  createSession: (title?: string) => string;
  setActive: (id: string) => void;
  addMessage: (id: string, msg: Message) => void;
  renameActiveIfEmpty: (proposed: string) => void;
  deleteSession: (id: string) => void;
  setWalletAddr: (addr: string | null) => void;
};

const Ctx = createContext<Store | null>(null);

const LS_SESS = "seiva:sessions";
const LS_ACTIVE = "seiva:active";
const LS_WALLET = "seiva:wallet";

function load<T>(k: string, def: T): T {
  if (typeof window === "undefined") return def;
  try { const s = localStorage.getItem(k); return s ? (JSON.parse(s) as T) : def; } catch { return def; }
}
function save(k: string, v: any) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => load(LS_SESS, []));
  const [activeId, setActiveId] = useState<string | null>(() => load(LS_ACTIVE, null));
  const [walletAddr, setWalletAddr] = useState<string | null>(() => load(LS_WALLET, null));

  // buat 1 sesi awal jika kosong
  useEffect(() => {
    if (!sessions.length) {
      const id = crypto.randomUUID();
      const now = Date.now();
      const s: ChatSession = { id, title: "New chat", createdAt: now, updatedAt: now, messages: [] };
      setSessions([s]); setActiveId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => save(LS_SESS, sessions), [sessions]);
  useEffect(() => save(LS_ACTIVE, activeId), [activeId]);
  useEffect(() => save(LS_WALLET, walletAddr), [walletAddr]);

  const api: Store = {
    sessions, activeId, walletAddr,
    setWalletAddr: (addr) => setWalletAddr(addr),

    createSession: (title = "New chat") => {
      const id = crypto.randomUUID();
      const now = Date.now();
      const s: ChatSession = { id, title, createdAt: now, updatedAt: now, messages: [] };
      setSessions(prev => [s, ...prev]);
      setActiveId(id);
      return id;
    },

    setActive: (id) => setActiveId(id),

    addMessage: (id, msg) => {
      setSessions(prev =>
        prev.map(s => s.id === id
          ? { ...s, updatedAt: Date.now(), messages: [...s.messages, msg] }
          : s
        )
      );
    },

    renameActiveIfEmpty: (proposed) => {
      const clean = (proposed || "").trim().replace(/\s+/g, " ");
      if (!clean) return;
      setSessions(prev =>
        prev.map(s => {
          if (s.id !== activeId) return s;
          if (s.title && s.title !== "New chat") return s;
          const title = clean.length > 60 ? clean.slice(0, 57) + "…" : clean;
          return { ...s, title };
        })
      );
    },

    deleteSession: (id) => {
      setSessions(prev => {
        const next = prev.filter(s => s.id !== id);
        setActiveId(curr => (curr === id ? (next[0]?.id ?? null) : curr));
        return next;
      });
    },
  };

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useChatStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatStore must be used within <ChatProvider>");
  return ctx;
}
