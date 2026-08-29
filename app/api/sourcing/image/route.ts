import { NextResponse } from "next/server";
import { BROWSER_HEADERS } from "@/lib/sourcing/normalize-url";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url?.startsWith("http")) {
    return NextResponse.json({ error: "URL invalide." }, { status: 400 });
  }

  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
    if (!res.ok) {
      return NextResponse.json({ error: "Image inaccessible." }, { status: 502 });
    }

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Téléchargement impossible." }, { status: 502 });
  }
}
