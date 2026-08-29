import { createHmac, randomBytes } from "crypto";
import { getTikTokConfig } from "./config";

type StagingEntry = {
  expiresAt: number;
  images: Buffer[];
  contentTypes: string[];
};

declare global {
  // eslint-disable-next-line no-var
  var __tiktokStaging: Map<string, StagingEntry> | undefined;
}

function stagingStore() {
  if (!globalThis.__tiktokStaging) {
    globalThis.__tiktokStaging = new Map();
  }
  return globalThis.__tiktokStaging;
}

function stagingSecret() {
  return getTikTokConfig()?.tokenSecret ?? "dev-staging-secret";
}

function signToken(id: string) {
  return createHmac("sha256", stagingSecret()).update(id).digest("hex").slice(0, 16);
}

export function createStagingToken(images: Buffer[], contentTypes: string[]) {
  purgeExpiredStaging();
  const id = randomBytes(12).toString("hex");
  const token = `${id}.${signToken(id)}`;
  stagingStore().set(token, {
    expiresAt: Date.now() + 60 * 60 * 1000,
    images,
    contentTypes,
  });
  return token;
}

export function getStagingImage(token: string, index: number) {
  purgeExpiredStaging();
  const [id, sig] = token.split(".");
  if (!id || !sig || sig !== signToken(id)) return null;

  const entry = stagingStore().get(token);
  if (!entry || entry.expiresAt <= Date.now()) {
    stagingStore().delete(token);
    return null;
  }

  const image = entry.images[index];
  if (!image) return null;

  return {
    buffer: image,
    contentType: entry.contentTypes[index] ?? "image/jpeg",
  };
}

function purgeExpiredStaging() {
  const now = Date.now();
  for (const [key, entry] of stagingStore()) {
    if (entry.expiresAt <= now) stagingStore().delete(key);
  }
}

export function buildStagingUrls(token: string, count: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL manquant.");
  return Array.from({ length: count }, (_, i) => `${appUrl}/api/tiktok/staging/${token}/${i}`);
}
