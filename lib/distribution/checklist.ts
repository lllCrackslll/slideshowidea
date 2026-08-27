const prefix = "kognia-checklist";

function keyForSession(sessionId: string): string {
  return `${prefix}-${sessionId}`;
}

export function loadChecklist(sessionId: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(keyForSession(sessionId));
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

export function toggleChecklistItem(
  sessionId: string,
  accountKey: string,
  done: boolean,
): Record<string, boolean> {
  const current = loadChecklist(sessionId);
  const next = { ...current, [accountKey]: done };
  localStorage.setItem(keyForSession(sessionId), JSON.stringify(next));
  return next;
}

export function resetChecklist(sessionId: string): void {
  localStorage.removeItem(keyForSession(sessionId));
}

export function checklistProgress(
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

export function makeSessionId(topic: string, date = new Date()): string {
  const d = date.toISOString().slice(0, 10);
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 24);
  return `${d}-${slug || "session"}`;
}
