import { refreshAccessToken } from "./oauth";
import {
  getTikTokConnection,
  saveTikTokConnection,
} from "./token-store";
import type { TikTokStoredConnection } from "./types";

export async function ensureAccessToken(
  connection: TikTokStoredConnection,
): Promise<{ token: string; connection: TikTokStoredConnection }> {
  const now = Date.now();
  if (connection.expiresAt > now + 60_000) {
    return { token: connection.accessToken, connection };
  }

  if (connection.refreshExpiresAt <= now) {
    throw new Error("Session TikTok expirée — reconnecte le compte.");
  }

  const refreshed = await refreshAccessToken(connection.refreshToken);
  if (refreshed.error || !refreshed.access_token) {
    throw new Error(refreshed.error_description ?? "Impossible de rafraîchir le token TikTok.");
  }

  const updated: TikTokStoredConnection = {
    ...connection,
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token ?? connection.refreshToken,
    expiresAt: now + refreshed.expires_in * 1000,
    refreshExpiresAt: now + refreshed.refresh_expires_in * 1000,
    scope: refreshed.scope ?? connection.scope,
  };
  await saveTikTokConnection(updated);
  return { token: updated.accessToken, connection: updated };
}

export async function getConnectionToken(
  workspaceId: string,
  accountId: string,
): Promise<{ token: string; connection: TikTokStoredConnection }> {
  const connection = await getTikTokConnection(workspaceId, accountId);
  if (!connection) throw new Error("Compte TikTok non connecté.");
  return ensureAccessToken(connection);
}
