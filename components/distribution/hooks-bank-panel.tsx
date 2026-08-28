"use client";

import { Shuffle, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { HOOKS_BANK, pickRandomHook } from "@/lib/hooks-bank";

type HooksBankPanelProps = {
  onApplyHook: (hook: string) => void;
};

export function HooksBankPanel({ onApplyHook }: HooksBankPanelProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "galere" | "methode" | "mindset">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HOOKS_BANK.filter((hook) => {
      if (q && !hook.toLowerCase().includes(q)) return false;
      if (category === "galere") {
        return /galère|failli|pire|paniqu|épuis|nul|échec|stress/i.test(hook);
      }
      if (category === "methode") {
        return /méthode|technique|révis|fiches|habitude|routine|fix|hack|stop/i.test(
          hook,
        );
      }
      if (category === "mindset") {
        return /motiv|seul|mérite|compar|organis|confiance|secret/i.test(hook);
      }
      return true;
    });
  }, [query, category]);

  return (
    <div className="space-y-3">
      <p className="text-[11px] k-text-muted">
        50 accroches prêtes pour le slide 1 — clique pour l&apos;appliquer.
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher…"
          className="k-input h-9 flex-1 text-sm"
        />
        <button
          type="button"
          onClick={() => onApplyHook(pickRandomHook())}
          className="k-btn-accent h-9 shrink-0 px-3 text-xs"
        >
          <Shuffle className="h-3.5 w-3.5" />
          Aléatoire
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["all", "Tous"],
            ["galere", "Galère"],
            ["methode", "Méthode"],
            ["mindset", "Mindset"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`k-chip text-[11px] ${category === id ? "k-chip-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="grid max-h-56 gap-1.5 overflow-y-auto sm:grid-cols-2">
        {filtered.slice(0, 24).map((hook) => (
          <li key={hook}>
            <button
              type="button"
              onClick={() => onApplyHook(hook)}
              className="k-list-item w-full text-left text-[11px] leading-snug k-text-secondary"
            >
              <Zap className="mt-0.5 h-3 w-3 shrink-0 k-accent" />
              {hook}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
