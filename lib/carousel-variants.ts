export type VariantProfile = {
  index: number;
  seed: number;
  brightness: number;
  contrast: number;
  saturation: number;
  zoomExtra: number;
  overlayOpacity: number;
  jpegQuality: number;
};

function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function pickRange(rand: () => number, min: number, max: number): number {
  return min + rand() * (max - min);
}

/** Profils visuels uniques par compte — évite les doublons TikTok sur le même texte. */
export function buildVariantProfiles(
  count: number,
  baseSeed = Date.now(),
): VariantProfile[] {
  return Array.from({ length: count }, (_, index) => {
    const rand = seededRandom(baseSeed + index * 9973);
    return {
      index,
      seed: baseSeed + index * 9973,
      brightness: pickRange(rand, 94, 108),
      contrast: pickRange(rand, 96, 106),
      saturation: pickRange(rand, 88, 112),
      zoomExtra: pickRange(rand, 0, 0.06),
      overlayOpacity: pickRange(rand, 0.48, 0.58),
      jpegQuality: pickRange(rand, 0.88, 0.96),
    };
  });
}

export function accountFolderName(index: number): string {
  return `compte-${String(index + 1).padStart(2, "0")}`;
}
