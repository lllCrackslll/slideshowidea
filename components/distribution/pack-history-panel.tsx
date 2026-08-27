"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  clearPackHistory,
  deletePackHistoryEntry,
  loadPackHistory,
} from "@/lib/distribution/pack-history";
import type { PackHistoryEntry } from "@/lib/distribution/types";

export function PackHistoryPanel() {
  const [entries, setEntries] = useState<PackHistoryEntry[]>([]);

  function refresh() {
    setEntries(loadPackHistory());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#86868b]">
        Derniers packs exportés (stockés localement dans ton navigateur).
      </p>

      {entries.length === 0 ? (
        <p className="text-xs text-[#aeaeb2]">Aucun export enregistré.</p>
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-start gap-2 rounded-xl border border-[rgba(0,122,255,0.1)] bg-white/90 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1d1d1f]">
                  {entry.label}
                </p>
                <p className="text-[11px] text-[#86868b]">
                  {new Date(entry.createdAt).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}{" "}
                  · {entry.accountCount} comptes
                  {entry.conceptCount > 1
                    ? ` · ${entry.conceptCount} concepts`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                title="Supprimer"
                onClick={() => {
                  deletePackHistoryEntry(entry.id);
                  refresh();
                }}
                className="shrink-0 rounded-lg p-1.5 text-[#aeaeb2] hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {entries.length > 0 ? (
        <button
          type="button"
          onClick={() => {
            clearPackHistory();
            refresh();
          }}
          className="k-btn-secondary h-9 w-full text-xs sm:w-auto"
        >
          Vider l&apos;historique
        </button>
      ) : null}
    </div>
  );
}
