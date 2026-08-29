import { NextResponse } from "next/server";
import { isTikTokConfigured } from "@/lib/tiktok/config";
import { listTikTokConnections } from "@/lib/tiktok/token-store";

export async function GET(request: Request) {
  if (!isTikTokConfigured()) {
    return NextResponse.json({ connections: [] });
  }

  const workspaceId = new URL(request.url).searchParams.get("workspaceId")?.trim();
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId requis." }, { status: 400 });
  }

  const connections = await listTikTokConnections(workspaceId);
  return NextResponse.json({ connections });
}
