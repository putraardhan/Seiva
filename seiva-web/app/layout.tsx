import "./globals.css";
import { ThemeProvider } from "next-themes";
import type { Metadata, Viewport } from "next";
import { ChatProvider } from "@/components/chat/ChatProvider";

export const metadata: Metadata = {
  title: "Seiva — Talk Crypto, Stay Informed",
  description: "Your onchain guide for Sei. Ask anything about crypto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black antialiased">
        <ThemeProvider attribute="class" forcedTheme="light" enableSystem={false}>
          <ChatProvider>{children}</ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
