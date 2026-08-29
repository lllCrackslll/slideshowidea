export type TikTokTokenResponse = {
  access_token: string;
  expires_in: number;
  open_id: string;
  refresh_expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
};

export type TikTokUserInfo = {
  open_id: string;
  display_name?: string;
  avatar_url?: string;
};

export type TikTokStoredConnection = {
  workspaceId: string;
  accountId: string;
  openId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
  scope: string;
  displayName?: string;
  avatarUrl?: string;
  connectedAt: string;
};

export type TikTokConnectionSummary = {
  accountId: string;
  openId: string;
  displayName?: string;
  avatarUrl?: string;
  connectedAt: string;
};

export type OAuthStatePayload = {
  csrf: string;
  workspaceId: string;
  accountId: string;
};
