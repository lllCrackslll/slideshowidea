import { NextResponse } from "next/server";
import { getStagingImage } from "@/lib/tiktok/staging";

type RouteContext = { params: Promise<{ token: string; index: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token, index: indexRaw } = await context.params;
  const index = Number(indexRaw);
  if (!Number.isInteger(index) || index < 0) {
    return NextResponse.json({ error: "Index invalide." }, { status: 400 });
  }

  const image = getStagingImage(token, index);
  if (!image) {
    return NextResponse.json({ error: "Média introuvable." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.buffer), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
