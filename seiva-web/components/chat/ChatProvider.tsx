"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Message = { id: string; role: "user" | "assistant"; content: string; ts: number };
export type ChatSession = { id: string; title: string; createdAt: number; updatedAt: number; messages: Message[] };

type ChatStore = {
  sessions: ChatSession[];
  activeId: string | null;
  activeSession: ChatSession | null;
  setActive: (id: string) => void;
  createSession: () => string;
  deleteSession: (id: string) => void;
  addMessage: (sessionId: string, msg: Message) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  walletAddr: string | null;
  setWalletAddr: (addr: string | null) => void;
};

const LS_SESS = "seiva:sessions";
const LS_ACTIVE = "seiva:active";
const LS_WALLET = "seiva:wallet";

function load<T>(k: string, def: T): T {
  if (typeof window === "undefined") return def;
  try {
    const s = localStorage.getItem(k);
    return s ? (JSON.parse(s) as T) : def;
  } catch {
    return def;
  }
}
function save(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
}

const Ctx = createContext<ChatStore | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>(() => load<ChatSession[]>(LS_SESS, []));
  const [activeId, setActiveId] = useState<string | null>(() => load<string | null>(LS_ACTIVE, null));
  const [walletAddr, setWalletAddr] = useState<string | null>(() => load<string | null>(LS_WALLET, null));

  // pastikan minimal 1 session
  useEffect(() => {
    if (!sessions.length) {
      const id = crypto.randomUUID();
      const now = Date.now();
      const first: ChatSession = { id, title: "New chat", createdAt: now, updatedAt: now, messages: [] };
      setSessions([first]);
      setActiveId(id);
    }
  }, [sessions.length]);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId]
  );

  function setActive(id: string) {
    setActiveId(id);
  }

  function createSession() {
    const id = crypto.randomUUID();
    const now = Date.now();
    const s: ChatSession = { id, title: "New chat", createdAt: now, updatedAt: now, messages: [] };
    setSessions((prev) => [s, ...prev]);
    setActiveId(id);
    return id;
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((x) => x.id !== id));
    setActiveId((curr) => (curr === id ? (sessions.find((x) => x.id !== id)?.id ?? null) : curr));
  }

  function addMessage(sessionId: string, msg: Message) {
    setSessions((prev) =>
      prev.map((s) =>
        s.id !== sessionId
          ? s
          : { ...s, updatedAt: msg.ts, messages: [...s.messages, msg] }
      )
    );
  }

  function updateSessionTitle(sessionId: string, title: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
    );
  }

  // persist
  useEffect(() => save(LS_SESS, sessions), [sessions]);
  useEffect(() => save(LS_ACTIVE, activeId), [activeId]);
  useEffect(() => save(LS_WALLET, walletAddr), [walletAddr]);

  const value: ChatStore = {
    sessions,
    activeId,
    activeSession,
    setActive,
    createSession,
    deleteSession,
    addMessage,
    updateSessionTitle,
    walletAddr,
    setWalletAddr,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChatStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useChatStore must be used within <ChatProvider>");
  return ctx;
}
