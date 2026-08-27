import { accountFolderSlug, defaultAccountName } from "./accounts";
import type { PublishSlot } from "./types";

type BuildPlanInput = {
  accountCount: number;
  accountNames?: string[];
  concepts?: Array<{ label: string; accountCount: number }>;
  startHour?: number;
  startMinute?: number;
  intervalMinutes?: number;
};

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addMinutes(h: number, m: number, delta: number): [number, number] {
  const total = h * 60 + m + delta;
  const day = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return [Math.floor(day / 60), day % 60];
}

/** Horaires décalés par compte — affichage uniquement (pas d'export CSV). */
export function buildPublishPlan(input: BuildPlanInput): PublishSlot[] {
  const {
    accountCount,
    accountNames = [],
    concepts,
    startHour = 8,
    startMinute = 0,
    intervalMinutes = 25,
  } = input;

  const slots: PublishSlot[] = [];
  let slotIndex = 0;
  let [hour, minute] = [startHour, startMinute];

  if (concepts && concepts.length > 0) {
    let globalIndex = 0;
    for (const concept of concepts) {
      for (let i = 0; i < concept.accountCount; i += 1) {
        const accountIndex = globalIndex;
        const label =
          accountNames[accountIndex]?.trim() ||
          defaultAccountName(accountIndex);
        slots.push({
          id: `slot-${accountIndex}`,
          accountIndex,
          accountLabel: label,
          conceptLabel: concept.label,
          time: padTime(hour, minute),
          sortKey: slotIndex,
        });
        [hour, minute] = addMinutes(hour, minute, intervalMinutes);
        slotIndex += 1;
        globalIndex += 1;
      }
    }
    return slots;
  }

  for (let accountIndex = 0; accountIndex < accountCount; accountIndex += 1) {
    const label =
      accountNames[accountIndex]?.trim() ||
      defaultAccountName(accountIndex);
    slots.push({
      id: `slot-${accountIndex}`,
      accountIndex,
      accountLabel: label,
      conceptLabel: "Carrousel du jour",
      time: padTime(hour, minute),
      sortKey: slotIndex,
    });
    [hour, minute] = addMinutes(hour, minute, intervalMinutes);
    slotIndex += 1;
  }

  return slots;
}

export function accountKeysFromPlan(slots: PublishSlot[]): string[] {
  return slots.map(
    (s) => accountFolderSlug(s.accountLabel, s.accountIndex),
  );
}
