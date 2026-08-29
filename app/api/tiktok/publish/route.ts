import { NextResponse } from "next/server";
import { isTikTokConfigured } from "@/lib/tiktok/config";
import { parsePostSettings } from "@/lib/tiktok/post-settings";
import { publishVideoToTikTok } from "@/lib/tiktok/publish";

export async function POST(request: Request) {
  if (!isTikTokConfigured()) {
    return NextResponse.json(
      { ok: false, error: "TikTok non configuré." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const workspaceId = String(form.get("workspaceId") ?? "").trim();
  const accountId = String(form.get("accountId") ?? "").trim();
  const caption = String(form.get("caption") ?? "").trim();
  const settings = parsePostSettings(String(form.get("settings") ?? ""));
  const video = form.get("video");

  if (!workspaceId || !accountId) {
    return NextResponse.json(
      { ok: false, error: "workspaceId et accountId requis." },
      { status: 400 },
    );
  }

  if (!settings) {
    return NextResponse.json(
      { ok: false, error: "Paramètres TikTok requis." },
      { status: 400 },
    );
  }

  if (!(video instanceof File) || video.size === 0) {
    return NextResponse.json(
      { ok: false, error: "Fichier vidéo requis." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await video.arrayBuffer());
  const contentType = video.type || "video/mp4";

  const result = await publishVideoToTikTok({
    workspaceId,
    accountId,
    video: buffer,
    contentType,
    caption,
    settings,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
