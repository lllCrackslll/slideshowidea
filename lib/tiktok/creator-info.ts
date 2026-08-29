import type { TikTokCreatorInfo } from "./post-settings";
import { getConnectionToken } from "./session";

type CreatorInfoResponse = {
  data?: {
    creator_avatar_url?: string;
    creator_username?: string;
    creator_nickname?: string;
    privacy_level_options?: string[];
    comment_disabled?: boolean;
    duet_disabled?: boolean;
    stitch_disabled?: boolean;
    max_video_post_duration_sec?: number;
  };
  error?: { code?: string; message?: string };
};

export async function fetchCreatorInfo(
  workspaceId: string,
  accountId: string,
): Promise<TikTokCreatorInfo> {
  const { token } = await getConnectionToken(workspaceId, accountId);

  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/creator_info/query/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    cache: "no-store",
  });

  const payload = (await res.json()) as CreatorInfoResponse;
  if (!res.ok || payload.error?.code !== "ok" || !payload.data) {
    throw new Error(payload.error?.message ?? "Impossible de charger les infos créateur TikTok.");
  }

  return {
    creatorAvatarUrl: payload.data.creator_avatar_url,
    creatorUsername: payload.data.creator_username,
    creatorNickname: payload.data.creator_nickname,
    privacyLevelOptions: payload.data.privacy_level_options ?? [],
    commentDisabled: Boolean(payload.data.comment_disabled),
    duetDisabled: Boolean(payload.data.duet_disabled),
    stitchDisabled: Boolean(payload.data.stitch_disabled),
    maxVideoPostDurationSec: payload.data.max_video_post_duration_sec ?? 600,
  };
}
