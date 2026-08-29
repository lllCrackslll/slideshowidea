import { getTikTokConfig } from "./config";
import { toApiPostInfo, type TikTokPostSettings } from "./post-settings";
import { buildStagingUrls, createStagingToken } from "./staging";
import { getConnectionToken } from "./session";

type TikTokApiError = {
  code?: string;
  message?: string;
};

type InitResponse = {
  data?: { publish_id?: string; upload_url?: string };
  error?: TikTokApiError;
};

export type TikTokPublishResult = {
  ok: boolean;
  publishId?: string;
  mode: "direct" | "inbox";
  error?: string;
};

type PhotoInitResponse = {
  data?: { publish_id?: string };
  error?: TikTokApiError;
};

function chunkPlan(videoSize: number) {
  const maxChunk = 10 * 1024 * 1024;
  if (videoSize <= maxChunk) {
    return { chunkSize: videoSize, totalChunkCount: 1 };
  }
  const chunkSize = maxChunk;
  return {
    chunkSize,
    totalChunkCount: Math.ceil(videoSize / chunkSize),
  };
}

async function initVideoUpload(
  accessToken: string,
  videoSize: number,
  caption: string,
  scopes: string,
  settings: TikTokPostSettings,
): Promise<{ publishId: string; uploadUrl: string; mode: "direct" | "inbox" }> {
  const { chunkSize, totalChunkCount } = chunkPlan(videoSize);
  const canDirectPost = scopes.includes("video.publish");

  const initUrl = canDirectPost
    ? "https://open.tiktokapis.com/v2/post/publish/video/init/"
    : "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";

  const body: Record<string, unknown> = {
    source_info: {
      source: "FILE_UPLOAD",
      video_size: videoSize,
      chunk_size: chunkSize,
      total_chunk_count: totalChunkCount,
    },
  };

  if (canDirectPost) {
    body.post_info = toApiPostInfo(settings, caption);
  }

  const res = await fetch(initUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await res.json()) as InitResponse;
  if (!res.ok || payload.error?.code !== "ok") {
    throw new Error(payload.error?.message ?? "Initialisation TikTok échouée.");
  }

  const publishId = payload.data?.publish_id;
  const uploadUrl = payload.data?.upload_url;
  if (!publishId || !uploadUrl) {
    throw new Error("Réponse TikTok incomplète.");
  }

  return {
    publishId,
    uploadUrl,
    mode: canDirectPost ? "direct" : "inbox",
  };
}

async function uploadVideoChunks(
  uploadUrl: string,
  video: Buffer,
  contentType: string,
): Promise<void> {
  const videoSize = video.byteLength;
  const { chunkSize, totalChunkCount } = chunkPlan(videoSize);

  for (let i = 0; i < totalChunkCount; i += 1) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, videoSize) - 1;
    const chunk = video.subarray(start, end + 1);

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      },
      body: new Uint8Array(chunk),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Envoi vidéo TikTok échoué (${res.status}).`);
    }
  }
}

export async function publishVideoToTikTok(params: {
  workspaceId: string;
  accountId: string;
  video: Buffer;
  contentType: string;
  caption: string;
  settings: TikTokPostSettings;
}): Promise<TikTokPublishResult> {
  if (!getTikTokConfig()) {
    return { ok: false, mode: "inbox", error: "TikTok non configuré sur le serveur." };
  }

  if (!params.settings.privacyLevel) {
    return { ok: false, mode: "inbox", error: "Confidentialité requise." };
  }

  try {
    const { token, connection: fresh } = await getConnectionToken(
      params.workspaceId,
      params.accountId,
    );
    const { publishId, uploadUrl, mode } = await initVideoUpload(
      token,
      params.video.byteLength,
      params.caption,
      fresh.scope,
      params.settings,
    );
    await uploadVideoChunks(uploadUrl, params.video, params.contentType);
    return { ok: true, publishId, mode };
  } catch (err) {
    return {
      ok: false,
      mode: "inbox",
      error: err instanceof Error ? err.message : "Publication TikTok échouée.",
    };
  }
}

async function initPhotoPost(
  accessToken: string,
  caption: string,
  photoUrls: string[],
  scopes: string,
  settings: TikTokPostSettings,
): Promise<{ publishId: string; mode: "direct" | "inbox" }> {
  const canDirectPost = scopes.includes("video.publish");
  const postMode = canDirectPost ? "DIRECT_POST" : "MEDIA_UPLOAD";
  const postInfo = toApiPostInfo(settings, caption);
  const title = caption.split("\n")[0]?.slice(0, 90) || "Carrousel";

  const body: Record<string, unknown> = {
    media_type: "PHOTO",
    post_mode: postMode,
    post_info: {
      ...postInfo,
      title,
      auto_add_music: true,
    },
    source_info: {
      source: "PULL_FROM_URL",
      photo_cover_index: 0,
      photo_images: photoUrls,
    },
  };

  if (!canDirectPost) {
    delete (body.post_info as Record<string, unknown>).privacy_level;
  }

  const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await res.json()) as PhotoInitResponse;
  if (!res.ok || payload.error?.code !== "ok") {
    throw new Error(payload.error?.message ?? "Initialisation carrousel TikTok échouée.");
  }

  const publishId = payload.data?.publish_id;
  if (!publishId) throw new Error("Réponse TikTok incomplète.");

  return { publishId, mode: canDirectPost ? "direct" : "inbox" };
}

export async function publishPhotosToTikTok(params: {
  workspaceId: string;
  accountId: string;
  images: Buffer[];
  contentTypes: string[];
  caption: string;
  settings: TikTokPostSettings;
}): Promise<TikTokPublishResult> {
  if (!getTikTokConfig()) {
    return { ok: false, mode: "inbox", error: "TikTok non configuré sur le serveur." };
  }

  if (!params.images.length) {
    return { ok: false, mode: "inbox", error: "Aucune image." };
  }

  if (!params.settings.privacyLevel) {
    return { ok: false, mode: "inbox", error: "Confidentialité requise." };
  }

  try {
    const { token, connection: fresh } = await getConnectionToken(
      params.workspaceId,
      params.accountId,
    );
    const stagingToken = createStagingToken(params.images, params.contentTypes);
    const photoUrls = buildStagingUrls(stagingToken, params.images.length);
    const { publishId, mode } = await initPhotoPost(
      token,
      params.caption,
      photoUrls,
      fresh.scope,
      params.settings,
    );
    return { ok: true, publishId, mode };
  } catch (err) {
    return {
      ok: false,
      mode: "inbox",
      error: err instanceof Error ? err.message : "Publication carrousel TikTok échouée.",
    };
  }
}
