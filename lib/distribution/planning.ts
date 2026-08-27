import { defaultAccountName } from "./accounts";

export type ScheduleItem = {
  id: string;
  accountIndex: number;
  accountLabel: string;
  postNumber: number;
  time: string;
  sortKey: number;
};

type BuildScheduleInput = {
  accountCount: number;
  postsPerDay: number;
  accountNames?: string[];
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

/** Horaires du jour : chaque compte × N posts, espacés. */
export function buildDailySchedule(input: BuildScheduleInput): ScheduleItem[] {
  const {
    accountCount,
    postsPerDay,
    accountNames = [],
    startHour = 8,
    startMinute = 0,
    intervalMinutes = 25,
  } = input;

  const items: ScheduleItem[] = [];
  let [hour, minute] = [startHour, startMinute];
  let sortKey = 0;

  for (let postNumber = 1; postNumber <= postsPerDay; postNumber += 1) {
    for (let accountIndex = 0; accountIndex < accountCount; accountIndex += 1) {
      const accountLabel =
        accountNames[accountIndex]?.trim() ||
        defaultAccountName(accountIndex);

      items.push({
        id: `${accountIndex}-post-${postNumber}`,
        accountIndex,
        accountLabel,
        postNumber,
        time: padTime(hour, minute),
        sortKey,
      });

      [hour, minute] = addMinutes(hour, minute, intervalMinutes);
      sortKey += 1;
    }
  }

  return items;
}

/** @deprecated use buildDailySchedule */
export function buildPublishPlan(input: {
  accountCount: number;
  accountNames?: string[];
  concepts?: Array<{ label: string; accountCount: number }>;
  startHour?: number;
  startMinute?: number;
  intervalMinutes?: number;
}): ScheduleItem[] {
  if (input.concepts?.length) {
    let globalIndex = 0;
    const items: ScheduleItem[] = [];
    let [hour, minute] = [input.startHour ?? 8, input.startMinute ?? 0];
    let sortKey = 0;
    const interval = input.intervalMinutes ?? 25;

    for (const concept of input.concepts) {
      for (let i = 0; i < concept.accountCount; i += 1) {
        const label =
          input.accountNames?.[globalIndex]?.trim() ||
          defaultAccountName(globalIndex);
        items.push({
          id: `slot-${globalIndex}`,
          accountIndex: globalIndex,
          accountLabel: label,
          postNumber: 1,
          time: padTime(hour, minute),
          sortKey,
        });
        [hour, minute] = addMinutes(hour, minute, interval);
        sortKey += 1;
        globalIndex += 1;
      }
    }
    return items;
  }

  return buildDailySchedule({
    accountCount: input.accountCount,
    postsPerDay: 1,
    accountNames: input.accountNames,
    startHour: input.startHour,
    startMinute: input.startMinute,
    intervalMinutes: input.intervalMinutes,
  });
}
