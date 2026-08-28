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
      <p className="text-[11px] k-text-muted">
        Derniers packs exportés (stockés localement dans ton navigateur).
      </p>

      {entries.length === 0 ? (
        <p className="text-xs k-text-faint">Aucun export enregistré.</p>
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="k-list-item flex items-start gap-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium k-text">
                  {entry.label}
                </p>
                <p className="text-[11px] k-text-muted">
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
                className="shrink-0 rounded-lg p-1.5 k-text-faint hover:bg-red-50 hover:text-red-500 dark:hover:text-red-400"
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
