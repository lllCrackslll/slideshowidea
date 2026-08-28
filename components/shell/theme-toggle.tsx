"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { applyTheme, resolveInitialTheme, type ThemeMode } from "@/lib/theme";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = resolveInitialTheme();
    setMode(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark";
    setMode(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="k-theme-toggle"
      aria-label={mode === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      title={mode === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {mounted ? (
        mode === "dark" ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )
      ) : (
        <Moon className="h-3.5 w-3.5 opacity-50" />
      )}
    </button>
  );
}
