import type { BrollCategory } from "@/lib/distribution/types";

export type BrollPools = Record<BrollCategory, string[]>;

const DEFAULT_POOLS: BrollPools = {
  hook: ["/broll/hook-1.jpg", "/broll/hook-2.jpg"],
  content: [
    "/broll/content-1.jpg",
    "/broll/content-2.jpg",
    "/broll/content-3.jpg",
  ],
  app: ["/broll/app-1.jpg", "/broll/app-2.jpg"],
  cta: ["/broll/cta-1.jpg", "/broll/cta-2.jpg"],
};

const STORAGE_KEY = "kognia-custom-broll";

export function loadCustomBroll(): BrollPools {
  if (typeof window === "undefined") {
    return { hook: [], content: [], app: [], cta: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { hook: [], content: [], app: [], cta: [] };
    return { ...{ hook: [], content: [], app: [], cta: [] }, ...JSON.parse(raw) };
  } catch {
    return { hook: [], content: [], app: [], cta: [] };
  }
}

export function saveCustomBroll(pools: BrollPools): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function addCustomBrollFile(
  file: File,
  category: BrollCategory,
): Promise<BrollPools> {
  const dataUrl = await fileToDataUrl(file);
  const pools = loadCustomBroll();
  pools[category] = [...pools[category], dataUrl].slice(-8);
  saveCustomBroll(pools);
  return pools;
}

export function removeCustomBrollAt(
  category: BrollCategory,
  index: number,
): BrollPools {
  const pools = loadCustomBroll();
  pools[category] = pools[category].filter((_, i) => i !== index);
  saveCustomBroll(pools);
  return pools;
}

export function getMergedBrollPools(): BrollPools {
  const custom = loadCustomBroll();
  return {
    hook: [...DEFAULT_POOLS.hook, ...custom.hook],
    content: [...DEFAULT_POOLS.content, ...custom.content],
    app: [...DEFAULT_POOLS.app, ...custom.app],
    cta: [...DEFAULT_POOLS.cta, ...custom.cta],
  };
}

export function brollPathForSlide(
  slideNumber: number,
  pools: BrollPools,
  rand: () => number,
): string {
  const pick = <T,>(items: T[]): T =>
    items[Math.floor(rand() * items.length)];

  if (slideNumber === 1) return pick(pools.hook);
  if (slideNumber === 4) return pick(pools.app);
  if (slideNumber === 5) return pick(pools.cta);
  return pick(pools.content);
}
