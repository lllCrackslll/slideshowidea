import { NextResponse } from "next/server";
import { createCsrfToken } from "@/lib/tiktok/crypto";
import { isTikTokConfigured } from "@/lib/tiktok/config";
import { buildAuthorizeUrl } from "@/lib/tiktok/oauth";

export async function GET(request: Request) {
  if (!isTikTokConfigured()) {
    return NextResponse.json({ error: "TikTok non configuré." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId")?.trim();
  const accountId = searchParams.get("accountId")?.trim();

  if (!workspaceId || !accountId) {
    return NextResponse.json(
      { error: "workspaceId et accountId requis." },
      { status: 400 },
    );
  }

  const url = buildAuthorizeUrl({
    csrf: createCsrfToken(),
    workspaceId,
    accountId,
  });

  return NextResponse.redirect(url);
}
