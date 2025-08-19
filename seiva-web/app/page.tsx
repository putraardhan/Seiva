"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";         // ⬅️ default import (TANPA kurung)
import { Chat } from "@/components/chat/Chat";

export default function HomePage() {
  const [hasChatted, setHasChatted] = useState(false);

  useEffect(() => {
    const onFirst = () => setHasChatted(true);
    window.addEventListener("seiva:first-message", onFirst as EventListener);
    return () => window.removeEventListener("seiva:first-message", onFirst as EventListener);
  }, []);

  return (
    <>
      <Sidebar />
      <main className="relative z-0 ml-80 h-dvh flex flex-col overflow-y-auto bg-white">
        <header className="sticky top-0 z-20 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
            <div className="flex items-center gap-2">
              <Image src="/logo-seiva.png" alt="Seiva" width={24} height={24} className="rounded-full" priority />
              <span className="font-semibold tracking-wide">Seiva</span>
            </div>
          </div>
        </header>

        {!hasChatted && (
          <section className="mx-auto w-full max-w-6xl px-4 py-10">
            <h1 className="text-center text-5xl font-extrabold tracking-tight md:text-6xl">
              SEIVA, <span className="text-[#DB3975]">YOU SEI ANALYST</span>
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-neutral-600">
              Navigate Sei with an On-Chain AI
            </p>
          </section>
        )}

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 pb-6">
          <Chat />
        </div>
      </main>
    </>
  );
}
