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
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

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

  if (url.hostname === "vm.tiktok.com" || url.hostname === "vt.tiktok.com") {
    const res = await fetch(url.toString(), {
      method: "HEAD",
      redirect: "follow",
      headers: BROWSER_HEADERS,
    });
    return res.url;
  }

  return url.toString();
}
