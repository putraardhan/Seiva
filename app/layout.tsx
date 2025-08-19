import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { ChatProvider } from "@/components/chat/ChatProvider";

export const metadata: Metadata = {
  title: "Seiva — Talk Crypto, Stay Informed",
  description: "Your onchain guide for Sei. Ask anything about crypto.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
          {/* Wajib: bungkus seluruh app dengan ChatProvider */}
          <ChatProvider>
            {children}
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
