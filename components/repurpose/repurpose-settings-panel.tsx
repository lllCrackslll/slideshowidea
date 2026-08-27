"use client";

import { FilterControl } from "@/components/repurpose/filter-control";
import type { RepurposeSettings } from "@/lib/repurpose/types";

type RepurposeSettingsPanelProps = {
  settings: RepurposeSettings;
  onChange: (settings: RepurposeSettings) => void;
  watermarkFile: File | null;
  onWatermarkFile: (file: File | null) => void;
};

function patchRange(
  settings: RepurposeSettings,
  key: keyof RepurposeSettings,
  partial: Partial<{ enabled: boolean; min: number; max: number }>,
): RepurposeSettings {
  const current = settings[key];
  if (typeof current !== "object" || current === null || !("min" in current)) {
    return settings;
  }
  return {
    ...settings,
    [key]: { ...current, ...partial },
  };
}

export function RepurposeSettingsPanel({
  settings,
  onChange,
  watermarkFile,
  onWatermarkFile,
}: RepurposeSettingsPanelProps) {
  const rangeKeys = [
    ["framerate", "Framerate", 1],
    ["videoBitrate", "Video bitrate (k)", 1],
    ["audioBitrate", "Audio bitrate (k)", 1],
    ["saturation", "Saturation", 0.01],
    ["contrast", "Contrast", 0.01],
    ["brightness", "Brightness", 0.01],
    ["vignette", "Vignette", 0.01],
    ["gamma", "Gamma", 0.01],
    ["speed", "Speed", 0.01],
    ["zoom", "Zoom", 0.01],
    ["noise", "Noise", 0.1],
    ["waveformShift", "Waveform shift", 0.1],
    ["volume", "Volume", 0.01],
    ["blurredBorder", "Blurred border", 1],
    ["cutoff", "Cutoff start (s)", 0.01],
    ["cutoffEnd", "Cutoff end (s)", 0.01],
    ["pixelShift", "Pixel shift", 0.1],
    ["rotation", "Rotation (°)", 0.1],
    ["lensCorrection", "Lens correction", 0.001],
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rangeKeys.map(([key, title, step]) => {
          const filter = settings[key] as RepurposeSettings["framerate"];
          return (
            <FilterControl
              key={key}
              title={title}
              enabled={filter.enabled}
              min={filter.min}
              max={filter.max}
              step={step}
              onToggle={(enabled) =>
                onChange(patchRange(settings, key, { enabled }))
              }
              onRange={(min, max) =>
                onChange(patchRange(settings, key, { min, max }))
              }
            />
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <ToggleRow
          label="Random pixel size"
          checked={settings.randomPixelSizeEnabled}
          onChange={(v) =>
            onChange({ ...settings, randomPixelSizeEnabled: v })
          }
        />
        <ToggleRow
          label="Horizontal flip"
          checked={settings.horizontalFlipEnabled}
          onChange={(v) =>
            onChange({ ...settings, horizontalFlipEnabled: v })
          }
        />
        <ToggleRow
          label="US metadata (GPS)"
          checked={settings.usMetadataEnabled}
          onChange={(v) => onChange({ ...settings, usMetadataEnabled: v })}
        />
        <ToggleRow
          label="Fixed dimensions"
          checked={settings.dimensionsEnabled}
          onChange={(v) => onChange({ ...settings, dimensionsEnabled: v })}
        />
      </div>

      {settings.dimensionsEnabled ? (
        <label className="block text-xs text-zinc-400">
          Dimensions (WxH)
          <input
            value={settings.dimensionsInput}
            onChange={(e) =>
              onChange({ ...settings, dimensionsInput: e.target.value })
            }
            placeholder="1080x1920"
            className="mt-1 h-9 w-full max-w-xs rounded-lg border border-[#27272a] bg-transparent px-2 text-zinc-100"
          />
        </label>
      ) : null}

      <div className="rounded-xl border border-[#27272a] bg-[#0c0c0e] p-3">
        <ToggleRow
          label="Watermark"
          checked={settings.watermarkEnabled}
          onChange={(v) => onChange({ ...settings, watermarkEnabled: v })}
        />
        {settings.watermarkEnabled ? (
          <div className="mt-3 space-y-2">
            <label className="block text-xs text-zinc-400">
              Image watermark
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => onWatermarkFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-xs text-zinc-500"
              />
              {watermarkFile ? (
                <span className="text-zinc-600">{watermarkFile.name}</span>
              ) : null}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <NumField
                label="Size"
                value={settings.watermarkSize}
                onChange={(v) =>
                  onChange({ ...settings, watermarkSize: v })
                }
              />
              <NumField
                label="Opacity"
                value={settings.watermarkOpacity}
                step={0.05}
                onChange={(v) =>
                  onChange({ ...settings, watermarkOpacity: v })
                }
              />
              <NumField
                label="X"
                value={settings.watermarkX}
                step={0.05}
                onChange={(v) => onChange({ ...settings, watermarkX: v })}
              />
              <NumField
                label="Y"
                value={settings.watermarkY}
                step={0.05}
                onChange={(v) => onChange({ ...settings, watermarkY: v })}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-[#27272a] bg-[#0c0c0e] px-3 py-2 text-xs text-zinc-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-zinc-100"
      />
      {label}
    </label>
  );
}

function NumField({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-[10px] text-zinc-500">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 h-7 w-full rounded border border-[#27272a] bg-transparent px-1.5 text-xs text-zinc-200"
      />
    </label>
  );
}
