import {
  DEFAULT_ADJUSTMENTS,
  type ImageAdjustments,
} from "@/lib/image-processing";

export type SpooferPreset = ImageAdjustments;

const STORAGE_KEY = "carrousels-spoofer-presets";

/** Inspiré des presets TikFusion Image Spoofer, adaptés au moteur canvas. */
export const BUILTIN_SPOOFER_PRESETS: Record<string, SpooferPreset> = {
  "Default Preset": {
    ...DEFAULT_ADJUSTMENTS,
    brightness: 103,
    contrast: 104,
    saturation: 104,
    rotation: 1,
    noise: 10,
    blurBorder: 6,
  },
  "TikTok Preset": {
    ...DEFAULT_ADJUSTMENTS,
    brightness: 106,
    contrast: 108,
    saturation: 106,
    rotation: 2,
    noise: 14,
    blurBorder: 8,
  },
  "Instagram Preset": {
    ...DEFAULT_ADJUSTMENTS,
    brightness: 108,
    contrast: 102,
    saturation: 112,
    rotation: -1,
    noise: 6,
    blurBorder: 4,
  },
  Subtil: {
    ...DEFAULT_ADJUSTMENTS,
    brightness: 101,
    contrast: 101,
    saturation: 101,
    noise: 4,
  },
  Fort: {
    ...DEFAULT_ADJUSTMENTS,
    brightness: 94,
    contrast: 116,
    saturation: 88,
    rotation: 3,
    noise: 22,
    blurBorder: 12,
    flipH: true,
  },
};

export const BUILTIN_SPOOFER_PRESET_NAMES = new Set(
  Object.keys(BUILTIN_SPOOFER_PRESETS),
);

export function loadCustomSpooferPresets(): Record<string, SpooferPreset> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, SpooferPreset>;
  } catch {
    return {};
  }
}

export function saveCustomSpooferPreset(name: string, preset: SpooferPreset): void {
  const all = loadCustomSpooferPresets();
  all[name] = preset;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteCustomSpooferPreset(name: string): void {
  const all = loadCustomSpooferPresets();
  delete all[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function allSpooferPresets(): Record<string, SpooferPreset> {
  return { ...BUILTIN_SPOOFER_PRESETS, ...loadCustomSpooferPresets() };
}
