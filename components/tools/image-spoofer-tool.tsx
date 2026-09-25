"use client";

import { useEffect, useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import {
  DEFAULT_ADJUSTMENTS,
  canvasToBlob,
  downloadBlob,
  drawAdjustedImage,
  loadImageFile,
  type ImageAdjustments,
} from "@/lib/image-processing";
import {
  allSpooferPresets,
  BUILTIN_SPOOFER_PRESET_NAMES,
  deleteCustomSpooferPreset,
  saveCustomSpooferPreset,
} from "@/lib/spoofer/presets";
import { getToolGuide } from "@/lib/tool-guides";

type SpooferTab = "simple" | "advanced";

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-xs k-text-muted">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#007aff]"
      />
    </label>
  );
}

export function ImageSpooferTool() {
  const [tab, setTab] = useState<SpooferTab>("simple");
  const [presets, setPresets] = useState(() => allSpooferPresets());
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(
    () => allSpooferPresets()["Default Preset"] ?? DEFAULT_ADJUSTMENTS,
  );
  const [presetName, setPresetName] = useState("Default Preset");
  const [customPresetName, setCustomPresetName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  function refreshPresets() {
    setPresets(allSpooferPresets());
  }

  useEffect(() => {
    refreshPresets();
  }, []);

  async function handleFile(files: File[]) {
    const next = files[0];
    if (!next) return;
    setFile(next);
    await refreshPreview(next, adjustments);
  }

  async function refreshPreview(f: File, adj: ImageAdjustments) {
    const img = await loadImageFile(f);
    const canvas = drawAdjustedImage(img, adj);
    setPreview(canvas.toDataURL("image/jpeg", 0.85));
  }

  function applyAdjustments(next: ImageAdjustments) {
    setAdjustments(next);
    if (file) void refreshPreview(file, next);
  }

  function patch(partial: Partial<ImageAdjustments>) {
    applyAdjustments({ ...adjustments, ...partial });
  }

  function applyPreset(name: string) {
    const preset = presets[name];
    if (!preset) return;
    applyAdjustments({ ...preset });
    setPresetName(name);
  }

  function handleSavePreset() {
    const name = customPresetName.trim();
    if (!name) return;
    saveCustomSpooferPreset(name, adjustments);
    refreshPresets();
    setPresetName(name);
    setCustomPresetName("");
    setMessage(`Preset « ${name} » sauvegardé.`);
  }

  function handleDeletePreset() {
    if (BUILTIN_SPOOFER_PRESET_NAMES.has(presetName)) return;
    deleteCustomSpooferPreset(presetName);
    refreshPresets();
    applyPreset("Default Preset");
    setMessage(`Preset « ${presetName} » supprimé.`);
  }

  async function exportImage() {
    if (!file) return;
    setBusy(true);
    try {
      const img = await loadImageFile(file);
      const canvas = drawAdjustedImage(img, adjustments);
      const blob = await canvasToBlob(canvas, "image/jpeg", adjustments.quality);
      downloadBlob(blob, `spoof-${file.name.replace(/\.[^.]+$/, "")}.jpg`);
    } finally {
      setBusy(false);
    }
  }

  const simpleSliders = ["brightness", "contrast", "saturation"] as const;

  return (
    <ToolPage
      title="Image Spoofer"
      subtitle="Transforme des images pour créer des variantes uniques."
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block min-w-[10rem] flex-1">
          <span className="k-label mb-1 block">Preset</span>
          <select
            value={presetName}
            onChange={(e) => applyPreset(e.target.value)}
            className="k-input h-10 w-full"
          >
            {Object.keys(presets).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[10rem] flex-1">
          <span className="k-label mb-1 block">Sauver preset as</span>
          <input
            value={customPresetName}
            onChange={(e) => setCustomPresetName(e.target.value)}
            placeholder="Mon preset"
            className="k-input h-10 w-full"
          />
        </label>
        <button type="button" onClick={handleSavePreset} className="k-btn-secondary h-10 px-4">
          Sauver
        </button>
        <button
          type="button"
          onClick={handleDeletePreset}
          disabled={BUILTIN_SPOOFER_PRESET_NAMES.has(presetName)}
          className="k-btn-ghost h-10 px-3 disabled:opacity-40"
        >
          Supprimer preset
        </button>
        <button
          type="button"
          onClick={() => applyPreset("Default Preset")}
          className="k-btn-ghost h-10 px-3"
        >
          Réinitialiser
        </button>
      </div>

      {message ? <p className="mb-4 text-xs k-text-muted">{message}</p> : null}

      <div className="mb-4 k-tab-bar">
        {(["simple", "advanced"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`k-tab capitalize ${tab === t ? "k-tab-active" : ""}`}
          >
            {t === "simple" ? "Simple" : "Advanced"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FileDropzone
            accept="image/png,image/jpeg,image/webp"
            label="Image source"
            onFiles={handleFile}
          />
          <div className="k-card space-y-3">
            {simpleSliders.map((key) => (
              <SliderRow
                key={key}
                label={key}
                min={50}
                max={150}
                value={adjustments[key]}
                onChange={(v) => patch({ [key]: v })}
              />
            ))}
            {tab === "advanced" ? (
              <>
                <SliderRow
                  label="Rotation"
                  min={-5}
                  max={5}
                  value={adjustments.rotation}
                  onChange={(v) => patch({ rotation: v })}
                />
                <SliderRow
                  label="Noise"
                  min={0}
                  max={30}
                  value={adjustments.noise}
                  onChange={(v) => patch({ noise: v })}
                />
                <SliderRow
                  label="Blur border %"
                  min={0}
                  max={15}
                  value={adjustments.blurBorder}
                  onChange={(v) => patch({ blurBorder: v })}
                />
                <label className="flex items-center gap-2 text-xs k-text-muted">
                  <input
                    type="checkbox"
                    checked={adjustments.flipH}
                    onChange={(e) => patch({ flipH: e.target.checked })}
                  />
                  Flip horizontal
                </label>
                <label className="flex items-center gap-2 text-xs k-text-muted">
                  <input
                    type="checkbox"
                    checked={adjustments.flipV}
                    onChange={(e) => patch({ flipV: e.target.checked })}
                  />
                  Flip vertical
                </label>
              </>
            ) : null}
          </div>
          <button
            type="button"
            disabled={!file || busy}
            onClick={exportImage}
            className="h-10 w-full k-btn-primary disabled:opacity-50"
          >
            Exporter l&apos;image
          </button>
        </div>
        <div className="k-card flex min-h-[280px] items-center justify-center">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="max-h-[420px] max-w-full rounded-lg object-contain"
            />
          ) : (
            <p className="text-xs k-text-faint">Aperçu ici</p>
          )}
        </div>
      </div>

      {getToolGuide("/image-spoofer") ? (
        <ToolTutorial
          guide={getToolGuide("/image-spoofer")!}
          className="mt-6"
        />
      ) : null}
    </ToolPage>
  );
}
