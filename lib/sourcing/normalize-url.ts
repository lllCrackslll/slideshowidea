export function isTikTokUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.hostname.endsWith("tiktok.com");
  } catch {
    return false;
  }
}

export const BROWSER_HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
  Referer: "https://www.tiktok.com/",
};

/** TikTok ne hydrate les carrousels que sur /video/, pas /photo/. */
export function canonicalizeTikTokUrl(raw: string): string {
  const url = new URL(raw.trim());
  if (url.pathname.includes("/photo/")) {
    url.pathname = url.pathname.replace("/photo/", "/video/");
  }
  return url.toString();
}

export async function resolveTikTokUrl(raw: string): Promise<string> {
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error("URL invalide.");
  }

  if (!url.hostname.endsWith("tiktok.com")) {
    throw new Error("Seuls les liens TikTok sont acceptés.");
  }

  let resolved = url.toString();

  if (url.hostname === "vm.tiktok.com" || url.hostname === "vt.tiktok.com") {
    const res = await fetch(resolved, {
      method: "GET",
      redirect: "follow",
      headers: BROWSER_HEADERS,
    });
    resolved = res.url;
  }

  return canonicalizeTikTokUrl(resolved);
}
