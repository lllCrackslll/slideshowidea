import { NextResponse } from "next/server";
import { isTikTokConfigured } from "@/lib/tiktok/config";
import { fetchCreatorInfo } from "@/lib/tiktok/creator-info";

export async function GET(request: Request) {
  if (!isTikTokConfigured()) {
    return NextResponse.json({ error: "TikTok non configuré." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId")?.trim();
  const accountId = searchParams.get("accountId")?.trim();

  if (!workspaceId || !accountId) {
    return NextResponse.json({ error: "workspaceId et accountId requis." }, { status: 400 });
  }

  try {
    const creator = await fetchCreatorInfo(workspaceId, accountId);
    return NextResponse.json({ creator });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur creator_info." },
      { status: 502 },
    );
  }
}
