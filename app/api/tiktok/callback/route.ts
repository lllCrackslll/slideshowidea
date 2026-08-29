import { NextResponse } from "next/server";
import { getTikTokConfig } from "@/lib/tiktok/config";
import {
  decodeSignedOAuthState,
  exchangeCodeForToken,
  fetchTikTokUserInfo,
} from "@/lib/tiktok/oauth";
import { saveTikTokConnection } from "@/lib/tiktok/token-store";

function redirectToSetup(params: Record<string, string>, origin: string) {
  const url = new URL("/setup", origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const config = getTikTokConfig();
  const origin = new URL(request.url).origin;
  const { searchParams } = new URL(request.url);

  if (!config) {
    return redirectToSetup({ tiktok: "error", reason: "config" }, origin);
  }

  const error = searchParams.get("error");
  if (error) {
    return redirectToSetup(
      { tiktok: "error", reason: error },
      origin,
    );
  }

  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  if (!code || !stateRaw) {
    return redirectToSetup({ tiktok: "error", reason: "missing_code" }, origin);
  }

  const state = decodeSignedOAuthState(stateRaw);
  if (!state?.workspaceId || !state.accountId) {
    return redirectToSetup({ tiktok: "error", reason: "invalid_state" }, origin);
  }

  try {
    const token = await exchangeCodeForToken(code);
    if (token.error || !token.access_token) {
      return redirectToSetup(
        { tiktok: "error", reason: token.error ?? "token" },
        origin,
      );
    }

    const user = await fetchTikTokUserInfo(token.access_token);
    const now = Date.now();

    await saveTikTokConnection({
      workspaceId: state.workspaceId,
      accountId: state.accountId,
      openId: token.open_id,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: now + token.expires_in * 1000,
      refreshExpiresAt: now + token.refresh_expires_in * 1000,
      scope: token.scope,
      displayName: user?.display_name,
      avatarUrl: user?.avatar_url,
      connectedAt: new Date().toISOString(),
    });

    const params: Record<string, string> = {
      tiktok: "connected",
      accountId: state.accountId,
    };
    if (user?.display_name) params.displayName = user.display_name;

    return redirectToSetup(params, origin);
  } catch {
    return redirectToSetup({ tiktok: "error", reason: "exchange" }, origin);
  }
}
