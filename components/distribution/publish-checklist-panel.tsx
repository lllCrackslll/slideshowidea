"use client";

import { Check, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { accountFolderSlug } from "@/lib/distribution/accounts";
import {
  checklistProgress,
  loadChecklist,
  resetChecklist,
  toggleChecklistItem,
} from "@/lib/distribution/checklist";
import type { PublishSlot } from "@/lib/distribution/types";

type PublishChecklistPanelProps = {
  sessionId: string;
  slots: PublishSlot[];
};

export function PublishChecklistPanel({
  sessionId,
  slots,
}: PublishChecklistPanelProps) {
  const [state, setState] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setState(loadChecklist(sessionId));
  }, [sessionId, slots.length]);

  const progress = checklistProgress(state, slots.length);

  function accountKey(slot: PublishSlot): string {
    return accountFolderSlug(slot.accountLabel, slot.accountIndex);
  }

  function toggle(slot: PublishSlot) {
    const key = accountKey(slot);
    const next = toggleChecklistItem(sessionId, key, !state[key]);
    setState(next);
  }

  function handleReset() {
    resetChecklist(sessionId);
    setState({});
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-[#86868b]">
          Coche chaque compte une fois le carrousel publié.
        </p>
        <span className="k-badge">
          {progress.done}/{progress.total} · {progress.percent}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[rgba(0,122,255,0.08)]">
        <div
          className="h-full rounded-full bg-[#007aff] transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <ul className="max-h-64 space-y-1.5 overflow-y-auto">
        {slots.map((slot) => {
          const key = accountKey(slot);
          const done = Boolean(state[key]);
          return (
            <li key={slot.id}>
              <button
                type="button"
                onClick={() => toggle(slot)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  done
                    ? "border-[rgba(0,122,255,0.25)] bg-[rgba(0,122,255,0.06)]"
                    : "border-[rgba(0,122,255,0.1)] bg-white/90"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    done
                      ? "border-[#007aff] bg-[#007aff] text-white"
                      : "border-[rgba(0,122,255,0.2)]"
                  }`}
                >
                  {done ? <Check className="h-3 w-3" /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[#1d1d1f]">
                  {slot.accountLabel}
                </span>
                <span className="shrink-0 text-xs tabular-nums text-[#86868b]">
                  {slot.time}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={handleReset}
        className="k-btn-secondary h-9 w-full text-xs sm:w-auto"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Réinitialiser la checklist
      </button>
    </div>
  );
}
