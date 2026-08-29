import { NextResponse } from "next/server";
import { getTikTokConfig } from "@/lib/tiktok/config";
import { getTikTokConnection, removeTikTokConnection } from "@/lib/tiktok/token-store";

export async function POST(request: Request) {
  const config = getTikTokConfig();
  if (!config) {
    return NextResponse.json({ error: "TikTok non configuré." }, { status: 503 });
  }

  const body = (await request.json()) as {
    workspaceId?: string;
    accountId?: string;
  };

  const workspaceId = body.workspaceId?.trim();
  const accountId = body.accountId?.trim();
  if (!workspaceId || !accountId) {
    return NextResponse.json(
      { error: "workspaceId et accountId requis." },
      { status: 400 },
    );
  }

  const connection = await getTikTokConnection(workspaceId, accountId);
  if (connection?.accessToken) {
    const bodyParams = new URLSearchParams({
      client_key: config.clientKey,
      client_secret: config.clientSecret,
      token: connection.accessToken,
    });
    await fetch("https://open.tiktokapis.com/v2/oauth/revoke/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: bodyParams,
    }).catch(() => undefined);
  }

  await removeTikTokConnection(workspaceId, accountId);
  return NextResponse.json({ ok: true });
}
