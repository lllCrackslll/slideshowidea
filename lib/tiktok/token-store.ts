import { cookies } from "next/headers";
import { decodeSignedPayload, encodeSignedPayload } from "./crypto";
import { getTikTokConfig } from "./config";
import type {
  TikTokConnectionSummary,
  TikTokStoredConnection,
} from "./types";

const COOKIE_NAME = "carrousels_tiktok_auth";

function connectionKey(workspaceId: string, accountId: string): string {
  return `${workspaceId}:${accountId}`;
}

function readStore(encoded: string | undefined): Record<string, TikTokStoredConnection> {
  const config = getTikTokConfig();
  if (!encoded || !config) return {};
  return decodeSignedPayload<Record<string, TikTokStoredConnection>>(
    encoded,
    config.tokenSecret,
  ) ?? {};
}

async function writeStore(store: Record<string, TikTokStoredConnection>): Promise<void> {
  const config = getTikTokConfig();
  if (!config) return;

  const jar = await cookies();
  jar.set(COOKIE_NAME, encodeSignedPayload(store, config.tokenSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getTikTokConnection(
  workspaceId: string,
  accountId: string,
): Promise<TikTokStoredConnection | null> {
  const jar = await cookies();
  const store = readStore(jar.get(COOKIE_NAME)?.value);
  return store[connectionKey(workspaceId, accountId)] ?? null;
}

export async function saveTikTokConnection(
  connection: TikTokStoredConnection,
): Promise<void> {
  const jar = await cookies();
  const store = readStore(jar.get(COOKIE_NAME)?.value);
  store[connectionKey(connection.workspaceId, connection.accountId)] = connection;
  await writeStore(store);
}

export async function removeTikTokConnection(
  workspaceId: string,
  accountId: string,
): Promise<void> {
  const jar = await cookies();
  const store = readStore(jar.get(COOKIE_NAME)?.value);
  delete store[connectionKey(workspaceId, accountId)];
  await writeStore(store);
}

export async function listTikTokConnections(
  workspaceId: string,
): Promise<TikTokConnectionSummary[]> {
  const jar = await cookies();
  const store = readStore(jar.get(COOKIE_NAME)?.value);

  return Object.values(store)
    .filter((item) => item.workspaceId === workspaceId)
    .map((item) => ({
      accountId: item.accountId,
      openId: item.openId,
      displayName: item.displayName,
      avatarUrl: item.avatarUrl,
      connectedAt: item.connectedAt,
    }));
}
