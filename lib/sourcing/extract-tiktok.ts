import { BROWSER_HEADERS, resolveTikTokUrl } from "./normalize-url";
import type { ImportedSlide, TikTokImportResult } from "./types";

const REHYDRATION_RE =
  /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i;

function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\w\u00C0-\u024F]+/g) ?? [];
  return [...new Set(matches.map((t) => t.replace(/^#/, "")))];
}

function findJsonInHtml(html: string, marker: string): unknown | null {
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const start = html.indexOf("{", idx);
  if (start === -1) return null;

  let depth = 0;
  for (let i = start; i < html.length; i += 1) {
    const ch = html[i];
    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;
    if (depth === 0) {
      try {
        return JSON.parse(html.slice(start, i + 1));
      } catch {
        return null;
      }
    }
  }
  return null;
}

function collectImageUrls(node: unknown, out: string[] = []): string[] {
  if (!node || typeof node !== "object") return out;

  if (Array.isArray(node)) {
    for (const item of node) collectImageUrls(item, out);
    return out;
  }

  const obj = node as Record<string, unknown>;

  if (obj.urlList && Array.isArray(obj.urlList)) {
    const first = obj.urlList.find((u) => typeof u === "string" && u.startsWith("http"));
    if (typeof first === "string") out.push(first);
  }

  if (typeof obj.imageURL === "object") {
    collectImageUrls(obj.imageURL, out);
  }

  for (const value of Object.values(obj)) {
    if (typeof value === "object") collectImageUrls(value, out);
  }

  return out;
}

function parseRehydrationJson(html: string): unknown | null {
  const match = REHYDRATION_RE.exec(html);
  if (!match?.[1]) return findJsonInHtml(html, "__UNIVERSAL_DATA_FOR_REHYDRATION__");

  try {
    return JSON.parse(match[1].trim());
  } catch {
    return findJsonInHtml(html, "__UNIVERSAL_DATA_FOR_REHYDRATION__");
  }
}

function extractFromUniversalData(html: string): {
  caption: string;
  author: string;
  images: string[];
} | null {
  const data = parseRehydrationJson(html);
  if (!data || typeof data !== "object") return null;

  const scope = (data as Record<string, unknown>)["__DEFAULT_SCOPE__"];
  if (!scope || typeof scope !== "object") return null;

  const detail =
    (scope as Record<string, unknown>)["webapp.video-detail"] ??
    (scope as Record<string, unknown>)["webapp.reflow.video.detail"];

  if (!detail || typeof detail !== "object") return null;

  const statusCode = (detail as Record<string, unknown>).statusCode;
  if (statusCode !== undefined && statusCode !== 0 && statusCode !== "0") {
    return null;
  }

  const itemInfo = (detail as Record<string, unknown>).itemInfo;
  if (!itemInfo || typeof itemInfo !== "object") return null;

  const itemStruct = (itemInfo as Record<string, unknown>).itemStruct;
  if (!itemStruct || typeof itemStruct !== "object") return null;

  const struct = itemStruct as Record<string, unknown>;
  const caption = typeof struct.desc === "string" ? struct.desc : "";
  const author =
    typeof struct.author === "object" && struct.author
      ? String((struct.author as Record<string, unknown>).uniqueId ?? "")
      : "";

  const images: string[] = [];

  const imagePost = struct.imagePost;
  if (imagePost && typeof imagePost === "object") {
    const postImages = (imagePost as Record<string, unknown>).images;
    if (Array.isArray(postImages)) {
      for (const img of postImages) {
        if (img && typeof img === "object") {
          const urlList = (img as Record<string, unknown>).imageURL;
          if (urlList && typeof urlList === "object") {
            const list = (urlList as Record<string, unknown>).urlList;
            if (Array.isArray(list) && typeof list[0] === "string") {
              images.push(list[0]);
            }
          }
        }
      }
    }
  }

  if (!images.length) {
    const urls = collectImageUrls(struct);
    const unique = [...new Set(urls)].filter(
      (u) => u.includes("tiktok") && !u.includes("avatar"),
    );
    images.push(...unique.slice(0, 10));
  }

  return { caption, author, images };
}

function extractFromSigiState(html: string): {
  caption: string;
  author: string;
  images: string[];
} | null {
  const match = html.match(/<script[^>]*>\s*window\[\"SIGI_STATE\"\]\s*=\s*(\{[\s\S]*?\})\s*;\s*<\/script>/);
  if (!match?.[1]) return null;

  try {
    const state = JSON.parse(match[1]) as Record<string, unknown>;
    const itemModule = state.ItemModule as Record<string, unknown> | undefined;
    if (!itemModule) return null;

    const firstKey = Object.keys(itemModule)[0];
    if (!firstKey) return null;

    const item = itemModule[firstKey] as Record<string, unknown>;
    const caption = typeof item.desc === "string" ? item.desc : "";
    const author = typeof item.author === "string" ? item.author : "";

    const images: string[] = [];
    if (item.imagePost && typeof item.imagePost === "object") {
      const postImages = (item.imagePost as Record<string, unknown>).images;
      if (Array.isArray(postImages)) {
        for (const img of postImages) {
          if (img && typeof img === "object") {
            const imageUrl = (img as Record<string, unknown>).imageURL;
            if (imageUrl && typeof imageUrl === "object") {
              const list = (imageUrl as Record<string, unknown>).urlList;
              if (Array.isArray(list) && typeof list[0] === "string") {
                images.push(list[0]);
              }
            }
          }
        }
      }
    }

    return { caption, author, images };
  } catch {
    return null;
  }
}

async function fetchOEmbedFallback(resolvedUrl: string): Promise<{
  caption: string;
  author: string;
  images: string[];
}> {
  const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(resolvedUrl)}`;
  const res = await fetch(oembedUrl, { headers: BROWSER_HEADERS });
  if (!res.ok) {
    throw new Error(
      "TikTok a refusé l'aperçu — vérifie que le post est public et réessaie.",
    );
  }

  const data = (await res.json()) as {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
  };

  return {
    caption: data.title ?? "",
    author: data.author_name ?? "",
    images: data.thumbnail_url ? [data.thumbnail_url] : [],
  };
}


function padSlides(images: string[], caption: string): ImportedSlide[] {
  const lines = caption.split("\n").filter(Boolean);
  const slides: ImportedSlide[] = images.slice(0, 10).map((imageUrl, i) => ({
    imageUrl,
    text: lines[i] ?? "",
  }));

  while (slides.length < 5) {
    slides.push({ imageUrl: "", text: lines[slides.length] ?? "" });
  }

  return slides;
}

export async function importTikTokPost(rawUrl: string): Promise<TikTokImportResult> {
  const resolvedUrl = await resolveTikTokUrl(rawUrl);

  const pageRes = await fetch(resolvedUrl, {
    headers: BROWSER_HEADERS,
    redirect: "follow",
  });

  if (!pageRes.ok) {
    throw new Error("TikTok a refusé la requête — réessaie ou importe manuellement.");
  }

  const html = await pageRes.text();
  let extracted =
    extractFromUniversalData(html) ?? extractFromSigiState(html);

  let partial = false;
  let hint: string | undefined;

  if (!extracted || !extracted.images.length) {
    try {
      extracted = await fetchOEmbedFallback(resolvedUrl);
      partial = true;
      hint =
        "Une seule vignette récupérée — ajoute les autres slides manuellement dans l'éditeur.";
    } catch {
      throw new Error(
        "Impossible de lire ce TikTok. Vérifie que c'est un carrousel photo public, ou passe par « Voir exemples » / l'éditeur.",
      );
    }
  }

  const { caption, author, images } = extracted;

  if (!images.length) {
    throw new Error(
      "Aucune image trouvée. Vérifie que c'est bien un carrousel photo (slideshow), pas une vidéo.",
    );
  }

  const dataUrls: string[] = [];
  for (const imgUrl of images.slice(0, 10)) {
    dataUrls.push(imgUrl);
  }

  const slides = padSlides(dataUrls, caption);
  const title = caption.split("\n")[0]?.slice(0, 80) || `TikTok @${author}`;

  return {
    title,
    author: author ? `@${author.replace(/^@/, "")}` : "",
    caption,
    hashtags: extractHashtags(caption),
    slides,
    sourceUrl: resolvedUrl,
    partial,
    hint,
  };
}
