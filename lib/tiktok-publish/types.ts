export type PublishFormat = "carousel" | "video";

export type TikTokConnectionStatus = "disconnected" | "connected" | "expired";

export type TikTokAccountLink = {
  accountIndex: number;
  label: string;
  status: TikTokConnectionStatus;
  connectedAt?: string;
};

export type WebshareProxyMode = "residential_static" | "residential_rotating";

export type PublishProxySettings = {
  enabled: boolean;
  provider: "webshare" | "none";
  apiKey: string;
  proxyMode: WebshareProxyMode;
  oneProxyPerAccount: boolean;
};

export type PublishDraft = {
  format: PublishFormat;
  caption: string;
  selectedAccountIndexes: number[];
  proxy: PublishProxySettings;
};

export type PublishQueueItem = {
  accountIndex: number;
  accountLabel: string;
  format: PublishFormat;
  status: "pending" | "simulated";
  scheduledAt: string;
};

export const DEFAULT_PROXY_SETTINGS: PublishProxySettings = {
  enabled: false,
  provider: "none",
  apiKey: "",
  proxyMode: "residential_static",
  oneProxyPerAccount: true,
};
