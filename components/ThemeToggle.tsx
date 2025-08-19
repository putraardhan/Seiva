"use client";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const current = theme ?? resolvedTheme ?? "system";
  const next = current === "light" ? "dark" : "light";
  return (
    <button
      onClick={() => setTheme(next)}
      className="rounded-xl border px-3 py-1 text-sm hover:bg-muted"
      aria-label="Toggle theme"
    >
      {current === "dark" ? "Dark" : current === "light" ? "Light" : "System"}
    </button>
  );
}
