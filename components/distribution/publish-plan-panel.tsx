"use client";

import { Clock } from "lucide-react";
import { useMemo } from "react";
import { buildPublishPlan } from "@/lib/distribution/planning";

type PublishPlanPanelProps = {
  accountCount: number;
  accountNames: string[];
  concepts?: Array<{ label: string; accountCount: number }>;
  startHour: number;
  startMinute: number;
  intervalMinutes: number;
  onStartHourChange: (v: number) => void;
  onStartMinuteChange: (v: number) => void;
  onIntervalChange: (v: number) => void;
};

export function PublishPlanPanel({
  accountCount,
  accountNames,
  concepts,
  startHour,
  startMinute,
  intervalMinutes,
  onStartHourChange,
  onStartMinuteChange,
  onIntervalChange,
}: PublishPlanPanelProps) {
  const slots = useMemo(
    () =>
      buildPublishPlan({
        accountCount,
        accountNames,
        concepts,
        startHour,
        startMinute,
        intervalMinutes,
      }),
    [
      accountCount,
      accountNames,
      concepts,
      startHour,
      startMinute,
      intervalMinutes,
    ],
  );

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-[#86868b]">
        Horaires suggérés décalés par compte — affichage sur le site uniquement.
      </p>

      <div className="grid grid-cols-3 gap-2 sm:max-w-md">
        <label className="text-[10px] text-[#aeaeb2]">
          Début (h)
          <input
            type="number"
            min={6}
            max={23}
            value={startHour}
            onChange={(e) => onStartHourChange(Number(e.target.value))}
            className="k-input mt-0.5 h-9 w-full text-sm"
          />
        </label>
        <label className="text-[10px] text-[#aeaeb2]">
          Min
          <input
            type="number"
            min={0}
            max={59}
            step={5}
            value={startMinute}
            onChange={(e) => onStartMinuteChange(Number(e.target.value))}
            className="k-input mt-0.5 h-9 w-full text-sm"
          />
        </label>
        <label className="text-[10px] text-[#aeaeb2]">
          Écart (min)
          <input
            type="number"
            min={10}
            max={120}
            step={5}
            value={intervalMinutes}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
            className="k-input mt-0.5 h-9 w-full text-sm"
          />
        </label>
      </div>

      <ul className="max-h-72 space-y-2 overflow-y-auto">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center gap-3 rounded-xl border border-[rgba(0,122,255,0.1)] bg-white/90 px-3 py-2.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[rgba(0,122,255,0.08)]">
              <Clock className="h-4 w-4 text-[#007aff]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1d1d1f]">
                {slot.accountLabel}
              </p>
              <p className="truncate text-[11px] text-[#86868b]">
                {slot.conceptLabel}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-[#007aff]">
              {slot.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
