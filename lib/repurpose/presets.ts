import type { RepurposePreset, RepurposeSettings } from "./types";

export const DEFAULT_REPURPOSE_SETTINGS: RepurposeSettings = {
  framerate: { enabled: true, min: 30, max: 60 },
  videoBitrate: { enabled: true, min: 5000, max: 6000 },
  audioBitrate: { enabled: false, min: 128, max: 320 },
  saturation: { enabled: true, min: 0.95, max: 0.95 },
  contrast: { enabled: true, min: 1.1, max: 1.1 },
  brightness: { enabled: true, min: 0.05, max: 0.05 },
  vignette: { enabled: true, min: 0.25, max: 0.5 },
  gamma: { enabled: true, min: 1.1, max: 1.1 },
  speed: { enabled: true, min: 1.03, max: 1.04 },
  zoom: { enabled: true, min: 1.03, max: 1.06 },
  noise: { enabled: true, min: 5, max: 5 },
  waveformShift: { enabled: false, min: 6, max: 6 },
  volume: { enabled: false, min: 1.3, max: 1.6 },
  blurredBorder: { enabled: false, min: 100, max: 100 },
  cutoff: { enabled: true, min: 0.1, max: 0.15 },
  cutoffEnd: { enabled: true, min: 0.1, max: 0.15 },
  pixelShift: { enabled: false, min: 3.5, max: 5.2 },
  rotation: { enabled: true, min: 0.9, max: 1.2 },
  lensCorrection: { enabled: false, min: 0.008, max: 0.01 },
  randomPixelSizeEnabled: true,
  horizontalFlipEnabled: false,
  usMetadataEnabled: true,
  dimensionsEnabled: false,
  dimensionsInput: "1080x1920",
  watermarkEnabled: false,
  watermarkSize: 100,
  watermarkOpacity: 0.5,
  watermarkX: 0.5,
  watermarkY: 0.5,
};

export const BUILTIN_PRESETS: Record<string, RepurposeSettings> = {
  "Instagram Preset": { ...DEFAULT_REPURPOSE_SETTINGS },
  "TikTok Preset": {
    ...DEFAULT_REPURPOSE_SETTINGS,
    framerate: { enabled: false, min: 30, max: 60 },
    videoBitrate: { enabled: false, min: 5000, max: 8000 },
    speed: { enabled: false, min: 1.03, max: 1.04 },
    vignette: { enabled: true, min: 0.5, max: 0.5 },
    waveformShift: { enabled: true, min: 6, max: 6 },
    blurredBorder: { enabled: true, min: 100, max: 100 },
    cutoff: { enabled: false, min: 0.1, max: 0.15 },
    cutoffEnd: { enabled: false, min: 0.1, max: 0.15 },
    rotation: { enabled: false, min: 0.9, max: 1.2 },
  },
};

const STORAGE_KEY = "kognia-repurpose-presets";

export function loadCustomPresets(): Record<string, RepurposeSettings> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, RepurposeSettings>) : {};
  } catch {
    return {};
  }
}

export function saveCustomPreset(name: string, settings: RepurposeSettings): void {
  const all = loadCustomPresets();
  all[name] = settings;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteCustomPreset(name: string): void {
  const all = loadCustomPresets();
  delete all[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function allPresets(): Record<string, RepurposeSettings> {
  return { ...BUILTIN_PRESETS, ...loadCustomPresets() };
}
