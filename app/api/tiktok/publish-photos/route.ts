import { NextResponse } from "next/server";
import { isTikTokConfigured } from "@/lib/tiktok/config";
import { parsePostSettings } from "@/lib/tiktok/post-settings";
import { publishPhotosToTikTok } from "@/lib/tiktok/publish";

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
  const images = form.getAll("images").filter((item): item is File => item instanceof File);

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

  if (!images.length) {
    return NextResponse.json(
      { ok: false, error: "Au moins une image requise." },
      { status: 400 },
    );
  }

  const buffers = await Promise.all(images.map((file) => file.arrayBuffer()));
  const result = await publishPhotosToTikTok({
    workspaceId,
    accountId,
    images: buffers.map((buf) => Buffer.from(buf)),
    contentTypes: images.map((file) => file.type || "image/jpeg"),
    caption,
    settings,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
