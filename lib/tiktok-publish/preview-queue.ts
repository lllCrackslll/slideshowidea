import { buildDailySchedule } from "@/lib/distribution/planning";
import { loadNamedAccounts } from "@/lib/distribution/accounts";
import { loadPlanningSettings } from "@/lib/distribution/planning-settings";
import type { PublishFormat, PublishQueueItem } from "./types";

/** Prévisualise la file d'attente (front only — pas d'appel API). */
export function buildPublishPreview(
  format: PublishFormat,
  selectedIndexes: number[],
): PublishQueueItem[] {
  if (!selectedIndexes.length) return [];

  const settings = loadPlanningSettings();
  const names = loadNamedAccounts(settings.accountCount).map((a) => a.name);

  const schedule = buildDailySchedule({
    accountCount: settings.accountCount,
    postsPerDay: 1,
    accountNames: names,
    startHour: settings.startHour,
    startMinute: settings.startMinute,
    intervalMinutes: settings.intervalMinutes,
  });

  const byIndex = new Map(schedule.map((item) => [item.accountIndex, item]));

  return selectedIndexes
    .slice()
    .sort((a, b) => a - b)
    .map((accountIndex) => {
      const slot = byIndex.get(accountIndex);
      return {
        accountIndex,
        accountLabel: slot?.accountLabel ?? `@compte-${accountIndex + 1}`,
        format,
        status: "pending" as const,
        scheduledAt: slot?.time ?? "—",
      };
    });
}
