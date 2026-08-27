export type RangeFilter = {
  enabled: boolean;
  min: number;
  max: number;
};

export type RepurposeSettings = {
  framerate: RangeFilter;
  videoBitrate: RangeFilter;
  audioBitrate: RangeFilter;
  saturation: RangeFilter;
  contrast: RangeFilter;
  brightness: RangeFilter;
  vignette: RangeFilter;
  gamma: RangeFilter;
  speed: RangeFilter;
  zoom: RangeFilter;
  noise: RangeFilter;
  waveformShift: RangeFilter;
  volume: RangeFilter;
  blurredBorder: RangeFilter;
  cutoff: RangeFilter;
  cutoffEnd: RangeFilter;
  pixelShift: RangeFilter;
  rotation: RangeFilter;
  lensCorrection: RangeFilter;
  randomPixelSizeEnabled: boolean;
  horizontalFlipEnabled: boolean;
  usMetadataEnabled: boolean;
  dimensionsEnabled: boolean;
  dimensionsInput: string;
  watermarkEnabled: boolean;
  watermarkSize: number;
  watermarkOpacity: number;
  watermarkX: number;
  watermarkY: number;
};

export type RepurposePreset = RepurposeSettings & { name: string };

export type BuiltRepurposeCommand = {
  outputOptions: string[];
  videoFilters: string[];
  audioFilters: string[];
  filterComplex?: string;
  ss?: number;
  t?: number;
  metadata: Record<string, string>;
};
