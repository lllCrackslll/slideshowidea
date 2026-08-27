import type { NamedAccount } from "./types";

const STORAGE_KEY = "kognia-named-accounts";

export function defaultAccountName(index: number): string {
  return `@compte-${String(index + 1).padStart(2, "0")}`;
}

export function loadNamedAccounts(count: number): NamedAccount[] {
  if (typeof window === "undefined") {
    return Array.from({ length: count }, (_, index) => ({
      index,
      name: defaultAccountName(index),
    }));
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw
      ? (JSON.parse(raw) as Record<string, string>)
      : {};

    return Array.from({ length: count }, (_, index) => ({
      index,
      name: saved[String(index)]?.trim() || defaultAccountName(index),
    }));
  } catch {
    return Array.from({ length: count }, (_, index) => ({
      index,
      name: defaultAccountName(index),
    }));
  }
}

export function saveNamedAccount(index: number, name: string): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  const saved = raw ? (JSON.parse(raw) as Record<string, string>) : {};
  saved[String(index)] = name.trim() || defaultAccountName(index);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

export function accountFolderSlug(name: string, index: number): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^@/, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);

  return slug || `compte-${String(index + 1).padStart(2, "0")}`;
}
