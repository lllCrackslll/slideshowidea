import type { Campaign } from "./types";

const DB_NAME = "carrousels-images";
const DB_VERSION = 1;
const STORE = "images";

type ImageKind = "import" | "slide" | "account";

export function isDataImageUrl(url: string): boolean {
  return url.startsWith("data:");
}

export function isIdbImageRef(url: string): boolean {
  return url.startsWith("idb:");
}

export function makeImageRef(
  campaignId: string,
  kind: "import" | "slide",
  index: number,
): string {
  return `idb:${campaignId}:${kind}:${index}`;
}

export function makeAccountImageRef(
  campaignId: string,
  accountId: string,
  index: number,
): string {
  return `idb:${campaignId}:account:${accountId}:${index}`;
}

function storageKeyImport(campaignId: string, index: number): string {
  return `${campaignId}:import:${index}`;
}

function storageKeySlide(campaignId: string, index: number): string {
  return `${campaignId}:slide:${index}`;
}

function storageKeyAccount(campaignId: string, accountId: string, index: number): string {
  return `${campaignId}:account:${accountId}:${index}`;
}

function parseImageRef(
  ref: string,
):
  | { campaignId: string; kind: "import" | "slide"; index: number }
  | { campaignId: string; kind: "account"; accountId: string; index: number }
  | null {
  const accountMatch = ref.match(/^idb:([^:]+):account:([^:]+):(\d+)$/);
  if (accountMatch) {
    return {
      campaignId: accountMatch[1],
      kind: "account",
      accountId: accountMatch[2],
      index: Number.parseInt(accountMatch[3], 10),
    };
  }
  const match = ref.match(/^idb:([^:]+):(import|slide):(\d+)$/);
  if (!match) return null;
  return {
    campaignId: match[1],
    kind: match[2] as "import" | "slide",
    index: Number.parseInt(match[3], 10),
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB"));
  });
}

export async function putImage(key: string, dataUrl: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(dataUrl, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Écriture IndexedDB"));
    };
  });
}

async function getImage(key: string): Promise<string | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => {
      db.close();
      resolve(typeof req.result === "string" ? req.result : null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error ?? new Error("Lecture IndexedDB"));
    };
  });
}

export async function resolveImageUrl(url: string): Promise<string> {
  if (!isIdbImageRef(url)) return url;
  const parsed = parseImageRef(url);
  if (!parsed) return url;

  let key: string;
  if (parsed.kind === "account") {
    key = storageKeyAccount(parsed.campaignId, parsed.accountId, parsed.index);
  } else {
    key =
      parsed.kind === "import"
        ? storageKeyImport(parsed.campaignId, parsed.index)
        : storageKeySlide(parsed.campaignId, parsed.index);
  }
  return (await getImage(key)) ?? "";
}

async function persistUrl(
  campaignId: string,
  kind: ImageKind,
  index: number,
  url: string,
  accountId?: string,
): Promise<string> {
  if (!isDataImageUrl(url)) return url;

  let key: string;
  let ref: string;
  if (kind === "account" && accountId) {
    key = storageKeyAccount(campaignId, accountId, index);
    ref = makeAccountImageRef(campaignId, accountId, index);
  } else if (kind === "import") {
    key = storageKeyImport(campaignId, index);
    ref = makeImageRef(campaignId, "import", index);
  } else {
    key = storageKeySlide(campaignId, index);
    ref = makeImageRef(campaignId, "slide", index);
  }

  await putImage(key, url);
  return ref;
}

export async function stripCampaignImages(campaign: Campaign): Promise<Campaign> {
  const importedImages = campaign.importedImages
    ? await Promise.all(
        campaign.importedImages.map((url, i) =>
          persistUrl(campaign.id, "import", i, url),
        ),
      )
    : undefined;

  const slides = await Promise.all(
    campaign.slides.map((slide, i) =>
      persistUrl(campaign.id, "slide", i, slide.imageUrl).then((imageUrl) => ({
        ...slide,
        imageUrl,
      })),
    ),
  );

  const accountMedia: Record<string, string[]> = {};
  if (campaign.accountMedia) {
    for (const [accountId, urls] of Object.entries(campaign.accountMedia)) {
      accountMedia[accountId] = await Promise.all(
        urls.map((url, i) => persistUrl(campaign.id, "account", i, url, accountId)),
      );
    }
  }

  return { ...campaign, importedImages, slides, accountMedia };
}

export async function hydrateCampaignImages(campaign: Campaign): Promise<Campaign> {
  const importedImages = campaign.importedImages
    ? await Promise.all(campaign.importedImages.map((url) => resolveImageUrl(url)))
    : undefined;

  const slides = await Promise.all(
    campaign.slides.map(async (slide) => ({
      ...slide,
      imageUrl: await resolveImageUrl(slide.imageUrl),
    })),
  );

  const accountMedia: Record<string, string[]> = {};
  if (campaign.accountMedia) {
    for (const [accountId, urls] of Object.entries(campaign.accountMedia)) {
      accountMedia[accountId] = await Promise.all(urls.map((url) => resolveImageUrl(url)));
    }
  }

  return { ...campaign, importedImages, slides, accountMedia };
}
