"use client";

import { Loader2, X } from "lucide-react";
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
import { downloadSpooferZip } from "@/lib/spoofer/download-zip";
import {
  allSpooferPresets,
  BUILTIN_SPOOFER_PRESET_NAMES,
  deleteCustomSpooferPreset,
  saveCustomSpooferPreset,
} from "@/lib/spoofer/presets";
import {
  randomizeAdjustments,
  slideFilename,
  variantFolderName,
} from "@/lib/spoofer/variations";
import { getToolGuide } from "@/lib/tool-guides";

type SpooferTab = "simple" | "advanced";

function spoofFilename(file: File): string {
  return `spoof-${file.name.replace(/\.[^.]+$/, "")}.jpg`;
}

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
  const [files, setFiles] = useState<File[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [variantsEnabled, setVariantsEnabled] = useState(false);
  const [numVariants, setNumVariants] = useState(3);
  const [busy, setBusy] = useState(false);

  const activeFile = files[activeIndex] ?? null;

  function refreshPresets() {
    setPresets(allSpooferPresets());
  }

  useEffect(() => {
    refreshPresets();
  }, []);

  async function refreshPreview(f: File, adj: ImageAdjustments) {
    const img = await loadImageFile(f);
    const canvas = drawAdjustedImage(img, adj);
    setPreview(canvas.toDataURL("image/jpeg", 0.85));
  }

  async function handleFiles(incoming: File[]) {
    const imageFiles = incoming.filter((f) => f.type.startsWith("image/"));
    if (!imageFiles.length) return;

    const startIndex = files.length;
    setFiles((prev) => [...prev, ...imageFiles]);
    setActiveIndex(startIndex);
    setMessage(null);
    await refreshPreview(imageFiles[0], adjustments);
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      const nextActive = Math.min(activeIndex, Math.max(0, next.length - 1));
      setActiveIndex(nextActive);
      const nextFile = next[nextActive];
      if (nextFile) void refreshPreview(nextFile, adjustments);
      else setPreview(null);
      return next;
    });
  }

  function selectFile(index: number) {
    const file = files[index];
    if (!file) return;
    setActiveIndex(index);
    void refreshPreview(file, adjustments);
  }

  function applyAdjustments(next: ImageAdjustments) {
    setAdjustments(next);
    if (activeFile) void refreshPreview(activeFile, next);
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

  async function renderSpoofedBlob(
    file: File,
    adj: ImageAdjustments = adjustments,
  ): Promise<Blob> {
    const img = await loadImageFile(file);
    const canvas = drawAdjustedImage(img, adj);
    return canvasToBlob(canvas, "image/jpeg", adj.quality);
  }

  async function exportVariantFolders() {
    const count = Math.max(2, Math.min(20, numVariants));
    const entries: { filename: string; blob: Blob }[] = [];

    for (let v = 0; v < count; v += 1) {
      const folder = variantFolderName(v);
      for (let i = 0; i < files.length; i += 1) {
        const adj = randomizeAdjustments(adjustments);
        const blob = await renderSpoofedBlob(files[i], adj);
        const filename =
          files.length > 1
            ? slideFilename(i)
            : files[i].name.replace(/\.[^.]+$/, "") + ".jpg";
        entries.push({ filename: `${folder}/${filename}`, blob });
      }
    }

    const readme = [
      "Pack variantes — carrousels.studio",
      "",
      `${count} dossier(s), ${files.length} image(s) par dossier.`,
      "Chaque variante = réglages aléatoires différents (luminosité, contraste, bruit…).",
      "1 dossier = 1 version unique prête à publier.",
    ].join("\n");

    await downloadSpooferZip(entries, "spoof-variantes", readme);
    setMessage(
      `${count} variantes générées (${count} dossiers × ${files.length} image${files.length > 1 ? "s" : ""}).`,
    );
  }

  async function exportImages() {
    if (!files.length) return;
    setBusy(true);
    setMessage(null);
    try {
      if (variantsEnabled) {
        await exportVariantFolders();
        return;
      }

      if (files.length === 1) {
        const blob = await renderSpoofedBlob(files[0]);
        downloadBlob(blob, spoofFilename(files[0]));
        setMessage("Image exportée.");
        return;
      }

      const entries = await Promise.all(
        files.map(async (file) => ({
          filename: spoofFilename(file),
          blob: await renderSpoofedBlob(file),
        })),
      );
      await downloadSpooferZip(entries, "spoof");
      setMessage(`${entries.length} images exportées en ZIP.`);
    } catch {
      setMessage("Export impossible.");
    } finally {
      setBusy(false);
    }
  }

  function exportLabel() {
    if (busy) return "Génération…";
    if (variantsEnabled) {
      const count = Math.max(2, Math.min(20, numVariants));
      return `Générer ${count} variantes (ZIP)`;
    }
    if (files.length > 1) return `Exporter tout (ZIP · ${files.length})`;
    return "Exporter l'image";
  }

  const simpleSliders = ["brightness", "contrast", "saturation"] as const;

  return (
    <ToolPage
      title="Image"
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
            multiple
            label="Images source"
            hint="Glisse plusieurs images ou clique pour parcourir"
            onFiles={handleFiles}
          />

          {files.length > 0 ? (
            <div className="k-card">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="k-label">
                  {files.length} image{files.length > 1 ? "s" : ""}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setActiveIndex(0);
                    setPreview(null);
                  }}
                  className="k-btn-ghost py-1 text-xs"
                >
                  Tout effacer
                </button>
              </div>
              <ul className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${index}`}
                    className={`flex max-w-[9rem] items-center gap-1 rounded-lg border px-2 py-1.5 text-xs transition-colors ${
                      index === activeIndex
                        ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => selectFile(index)}
                      className="min-w-0 flex-1 truncate text-left k-text"
                    >
                      {file.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="shrink-0 rounded p-0.5 k-text-muted hover:k-text"
                      aria-label={`Retirer ${file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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

          <div className="k-card space-y-3">
            <label className="flex cursor-pointer items-start gap-2 text-sm k-text">
              <input
                type="checkbox"
                checked={variantsEnabled}
                onChange={(e) => setVariantsEnabled(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Variantes uniques</span>
                <span className="mt-0.5 block text-xs k-text-muted">
                  Génère plusieurs dossiers ({`variante-01`}, {`variante-02`}…) avec des
                  images toutes différentes.
                </span>
              </span>
            </label>
            {variantsEnabled ? (
              <label className="block">
                <span className="k-label mb-1 block">Nombre de variantes</span>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={numVariants}
                  onChange={(e) =>
                    setNumVariants(Math.max(2, Math.min(20, Number(e.target.value) || 2)))
                  }
                  className="k-input h-10 w-24"
                />
              </label>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!files.length || busy}
            onClick={() => void exportImages()}
            className="flex h-10 w-full items-center justify-center gap-2 k-btn-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {exportLabel()}
          </button>
        </div>
        <div className="k-card flex min-h-[280px] flex-col items-center justify-center">
          {preview ? (
            <>
              {activeFile ? (
                <p className="mb-2 max-w-full truncate text-xs k-text-muted">
                  Aperçu · {activeFile.name}
                </p>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="max-h-[420px] max-w-full rounded-lg object-contain"
              />
            </>
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
