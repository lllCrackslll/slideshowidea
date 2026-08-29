const DEFAULT_SCOPES = ["user.info.basic", "video.upload"] as const;

export function getTikTokConfig() {
  const clientKey = process.env.TIKTOK_CLIENT_KEY?.trim();
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  const tokenSecret = process.env.TIKTOK_TOKEN_SECRET?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const redirectUri =
    process.env.TIKTOK_REDIRECT_URI?.trim() ||
    (appUrl ? `${appUrl}/api/tiktok/callback` : "");

  if (!clientKey || !clientSecret || !tokenSecret || !redirectUri) {
    return null;
  }

  return {
    clientKey,
    clientSecret,
    tokenSecret,
    redirectUri,
    scopes: DEFAULT_SCOPES.join(","),
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    userInfoUrl: "https://open.tiktokapis.com/v2/user/info/",
  };
}

export function isTikTokConfigured(): boolean {
  return getTikTokConfig() !== null;
}
