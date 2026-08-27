import type { PackHistoryEntry } from "./types";

const STORAGE_KEY = "kognia-pack-history";
const MAX_ENTRIES = 30;

export function loadPackHistory(): PackHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PackHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function savePackHistoryEntry(
  entry: Omit<PackHistoryEntry, "id" | "createdAt">,
): PackHistoryEntry {
  const full: PackHistoryEntry = {
    ...entry,
    id: `pack-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const prev = loadPackHistory();
  const next = [full, ...prev].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return full;
}

export function deletePackHistoryEntry(id: string): void {
  const next = loadPackHistory().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function clearPackHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
