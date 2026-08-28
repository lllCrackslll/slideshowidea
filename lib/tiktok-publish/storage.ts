import { defaultAccountName, loadNamedAccounts } from "@/lib/distribution/accounts";
import { loadPlanningSettings } from "@/lib/distribution/planning-settings";
import {
  DEFAULT_PROXY_SETTINGS,
  type PublishProxySettings,
  type TikTokAccountLink,
  type TikTokConnectionStatus,
} from "./types";

const CONNECTIONS_KEY = "carrousels-tiktok-connections";
const PROXY_KEY = "carrousels-publish-proxy";

function loadConnectionMap(): Record<string, TikTokConnectionStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TikTokConnectionStatus>) : {};
  } catch {
    return {};
  }
}

export function saveConnectionStatus(
  accountIndex: number,
  status: TikTokConnectionStatus,
): void {
  const map = loadConnectionMap();
  map[String(accountIndex)] = status;
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(map));
}

/** Comptes Planning + statut OAuth TikTok (mock front — backend requis). */
export function loadPublishAccounts(): TikTokAccountLink[] {
  const { accountCount } = loadPlanningSettings();
  const names = loadNamedAccounts(accountCount);
  const connections = loadConnectionMap();

  return names.map((account) => ({
    accountIndex: account.index,
    label: account.name.trim() || defaultAccountName(account.index),
    status: connections[String(account.index)] ?? "disconnected",
    connectedAt:
      connections[String(account.index)] === "connected"
        ? new Date().toISOString()
        : undefined,
  }));
}

export function toggleMockConnection(accountIndex: number): TikTokAccountLink[] {
  const map = loadConnectionMap();
  const current = map[String(accountIndex)] ?? "disconnected";
  map[String(accountIndex)] =
    current === "connected" ? "disconnected" : "connected";
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(map));
  return loadPublishAccounts();
}

export function loadProxySettings(): PublishProxySettings {
  if (typeof window === "undefined") return DEFAULT_PROXY_SETTINGS;
  try {
    const raw = localStorage.getItem(PROXY_KEY);
    if (!raw) return DEFAULT_PROXY_SETTINGS;
    return { ...DEFAULT_PROXY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROXY_SETTINGS;
  }
}

export function saveProxySettings(
  partial: Partial<PublishProxySettings>,
): PublishProxySettings {
  const next = { ...loadProxySettings(), ...partial };
  localStorage.setItem(PROXY_KEY, JSON.stringify(next));
  return next;
}
