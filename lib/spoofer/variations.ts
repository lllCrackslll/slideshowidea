import type { ImageAdjustments } from "@/lib/image-processing";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function jitter(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * 2 * spread;
}

/** Dérive aléatoirement les réglages à partir du preset courant. */
export function randomizeAdjustments(base: ImageAdjustments): ImageAdjustments {
  const flipHChance = base.flipH ? 0.25 : 0.35;

  return {
    ...base,
    brightness: clamp(Math.round(jitter(base.brightness, 5)), 50, 150),
    contrast: clamp(Math.round(jitter(base.contrast, 6)), 50, 150),
    saturation: clamp(Math.round(jitter(base.saturation, 7)), 50, 150),
    rotation: clamp(Math.round(jitter(base.rotation, 1.5) * 10) / 10, -5, 5),
    noise: clamp(Math.round(jitter(base.noise, 6)), 0, 30),
    blurBorder: clamp(Math.round(jitter(base.blurBorder, 3)), 0, 15),
    flipH: Math.random() < flipHChance ? !base.flipH : base.flipH,
    flipV: Math.random() < 0.15 ? !base.flipV : base.flipV,
    quality: clamp(jitter(base.quality, 0.04), 0.75, 0.95),
  };
}

export function variantFolderName(index: number): string {
  return `variante-${String(index + 1).padStart(2, "0")}`;
}

export function slideFilename(index: number): string {
  return `slide-${String(index + 1).padStart(2, "0")}.jpg`;
}
