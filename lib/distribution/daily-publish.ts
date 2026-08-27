function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function storageKey(date: string): string {
  return `carrousels-publish-${date}`;
}

export function publishItemKey(accountIndex: number, postNumber: number): string {
  return `${accountIndex}-post-${postNumber}`;
}

export function loadDailyPublishState(
  date = todayKey(),
): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(date));
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function togglePublishItem(
  accountIndex: number,
  postNumber: number,
  done: boolean,
  date = todayKey(),
): Record<string, boolean> {
  const current = loadDailyPublishState(date);
  const key = publishItemKey(accountIndex, postNumber);
  const next = { ...current, [key]: done };
  localStorage.setItem(storageKey(date), JSON.stringify(next));
  return next;
}

export function resetDailyPublishState(date = todayKey()): void {
  localStorage.removeItem(storageKey(date));
}

export function publishProgress(
  state: Record<string, boolean>,
  total: number,
): { done: number; total: number; percent: number } {
  const done = Object.values(state).filter(Boolean).length;
  return {
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export function formatTodayLabel(date = new Date()): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
