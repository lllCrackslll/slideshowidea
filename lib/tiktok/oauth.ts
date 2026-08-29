import { decodeSignedPayload, encodeSignedPayload } from "./crypto";
import { getTikTokConfig } from "./config";
import type { OAuthStatePayload, TikTokTokenResponse, TikTokUserInfo } from "./types";

export function buildAuthorizeUrl(state: OAuthStatePayload): string {
  const config = getTikTokConfig();
  if (!config) throw new Error("TikTok non configuré.");

  const params = new URLSearchParams({
    client_key: config.clientKey,
    scope: config.scopes,
    response_type: "code",
    redirect_uri: config.redirectUri,
    state: encodeSignedOAuthState(state),
  });

  return `${config.authorizeUrl}?${params.toString()}`;
}

export function encodeSignedOAuthState(state: OAuthStatePayload): string {
  const config = getTikTokConfig();
  if (!config) throw new Error("TikTok non configuré.");
  return encodeSignedPayload(state, config.tokenSecret);
}

export function decodeSignedOAuthState(value: string): OAuthStatePayload | null {
  const config = getTikTokConfig();
  if (!config) return null;
  return decodeSignedPayload<OAuthStatePayload>(value, config.tokenSecret);
}

export async function exchangeCodeForToken(code: string): Promise<TikTokTokenResponse> {
  const config = getTikTokConfig();
  if (!config) throw new Error("TikTok non configuré.");

  const body = new URLSearchParams({
    client_key: config.clientKey,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
  });

  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });

  return (await res.json()) as TikTokTokenResponse;
}

export async function fetchTikTokUserInfo(
  accessToken: string,
): Promise<TikTokUserInfo | null> {
  const config = getTikTokConfig();
  if (!config) return null;

  const url = new URL(config.userInfoUrl);
  url.searchParams.set("fields", "open_id,display_name,avatar_url");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  const payload = (await res.json()) as {
    data?: { user?: TikTokUserInfo };
    error?: { code?: string; message?: string };
  };

  if (!res.ok || payload.error?.code !== "ok") return null;
  return payload.data?.user ?? null;
}
