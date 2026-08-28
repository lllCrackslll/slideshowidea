import { NextResponse } from "next/server";
import { importTikTokPost } from "@/lib/sourcing/extract-tiktok";
import { isTikTokUrl } from "@/lib/sourcing/normalize-url";
import type { TikTokImportRequest } from "@/lib/sourcing/types";

export const maxDuration = 30;

export async function POST(request: Request) {
  let body: TikTokImportRequest;
  try {
    body = (await request.json()) as TikTokImportRequest;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "URL TikTok requise." }, { status: 400 });
  }

  if (!isTikTokUrl(url)) {
    return NextResponse.json(
      { error: "Colle un lien TikTok valide (tiktok.com ou vm.tiktok.com)." },
      { status: 400 },
    );
  }

  try {
    const result = await importTikTokPost(url);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/sourcing/import]", error);
    const message =
      error instanceof Error
        ? error.message
        : "Import impossible — réessaie ou passe par l'éditeur manuel.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
