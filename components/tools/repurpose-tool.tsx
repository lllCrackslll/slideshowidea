"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Package, Sparkles } from "lucide-react";
import { RepurposeSettingsPanel } from "@/components/repurpose/repurpose-settings-panel";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { useFfmpeg } from "@/hooks/use-ffmpeg";
import { downloadBlob } from "@/lib/image-processing";
import {
  downloadRepurposeZip,
  type RepurposeZipEntry,
} from "@/lib/repurpose/download-zip";
import { getToolGuide } from "@/lib/tool-guides";
import {
  BUILTIN_PRESETS,
  DEFAULT_REPURPOSE_SETTINGS,
  allPresets,
  deleteCustomPreset,
  saveCustomPreset,
} from "@/lib/repurpose/presets";
import type { RepurposeSettings } from "@/lib/repurpose/types";

type GeneratedVideo = {
  id: string;
  filename: string;
  blob: Blob;
  url: string;
};

function releaseResults(results: GeneratedVideo[]): void {
  for (const item of results) {
    URL.revokeObjectURL(item.url);
  }
}

export function RepurposeTool() {
  const [settings, setSettings] = useState<RepurposeSettings>(
    DEFAULT_REPURPOSE_SETTINGS,
  );
  const [presetName, setPresetName] = useState("Instagram Preset");
  const [customPresetName, setCustomPresetName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [copies, setCopies] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedVideo[]>([]);
  const [zipLabel, setZipLabel] = useState("repurpose");
  const [downloadingZip, setDownloadingZip] = useState(false);

  const { loading, progress, log, repurpose, load } = useFfmpeg();
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const [presets, setPresets] =
    useState<Record<string, RepurposeSettings>>(BUILTIN_PRESETS);

  function refreshPresets() {
    setPresets(allPresets());
  }

  useEffect(() => {
    refreshPresets();
    return () => releaseResults(resultsRef.current);
  }, []);

  function clearResults() {
    setResults((current) => {
      releaseResults(current);
      return [];
    });
  }

  async function handleGenerate() {
    if (!files.length) {
      setMessage("Ajoute au moins une vidéo.");
      return;
    }
    if (settings.watermarkEnabled && !watermarkFile) {
      setMessage("Active le watermark sans image — ajoute une image ou désactive.");
      return;
    }

    setBusy(true);
    setMessage(null);
    clearResults();

    try {
      await load();
      let done = 0;
      const total = files.length * copies;
      const generated: GeneratedVideo[] = [];

      for (const file of files) {
        const base = file.name.replace(/\.[^.]+$/, "");
        for (let i = 0; i < copies; i += 1) {
          const blob = await repurpose(
            file,
            settings,
            watermarkFile,
            `out-${Date.now()}-${i}.mp4`,
          );
          const suffix = String.fromCharCode(97 + (i % 26));
          const filename = `${base}-repurpose-${suffix}.mp4`;
          generated.push({
            id: `${filename}-${Date.now()}-${i}`,
            filename,
            blob,
            url: URL.createObjectURL(blob),
          });
          done += 1;
          setMessage(`Variante ${done}/${total}…`);
        }
      }

      setResults(generated);
      setZipLabel(
        files.length === 1
          ? files[0].name.replace(/\.[^.]+$/, "")
          : "repurpose",
      );
      setMessage(`${total} variante(s) prête(s) — télécharge une vidéo ou le ZIP.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Repurpose échoué — essaie une vidéo plus courte.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadZip() {
    if (!results.length) return;
    setDownloadingZip(true);
    try {
      const entries: RepurposeZipEntry[] = results.map((item) => ({
        filename: item.filename,
        blob: item.blob,
      }));
      await downloadRepurposeZip(entries, zipLabel);
    } finally {
      setDownloadingZip(false);
    }
  }

  function applyPreset(name: string) {
    const preset = presets[name];
    if (preset) {
      setSettings({ ...preset });
      setPresetName(name);
    }
  }

  function handleSavePreset() {
    const name = customPresetName.trim();
    if (!name) return;
    saveCustomPreset(name, settings);
    refreshPresets();
    setPresetName(name);
    setCustomPresetName("");
    setMessage(`Preset « ${name} » sauvegardé.`);
  }

  function handleDeletePreset() {
    if (presetName in presets && !(presetName in { "Instagram Preset": 1, "TikTok Preset": 1 })) {
      deleteCustomPreset(presetName);
      refreshPresets();
      applyPreset("Instagram Preset");
      setMessage(`Preset « ${presetName} » supprimé.`);
    }
  }

  return (
    <ToolPage
      title="Repurpose Bot"
      subtitle="Variantes uniques — filtres, presets, watermark, metadata US."
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <label className="text-xs k-text-muted">
          Preset
          <select
            value={presetName}
            onChange={(e) => applyPreset(e.target.value)}
            className="k-input mt-1 block h-9 min-w-[160px] text-sm"
          >
            {Object.keys(presets).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs k-text-muted">
          Sauver preset as
          <input
            value={customPresetName}
            onChange={(e) => setCustomPresetName(e.target.value)}
            placeholder="Mon preset"
            className="mt-1 block h-9 w-36 k-input px-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={handleSavePreset}
          className="k-btn-secondary h-9 px-3 text-xs"
        >
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={handleDeletePreset}
          className="k-btn-secondary h-9 px-3 text-xs k-text-muted"
        >
          Supprimer preset
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <section className="k-card-glow">
            <p className="k-label">Vidéos source</p>
            <p className="mt-1 text-xs k-text-muted">
              Glisse tes fichiers ou clique dans la zone ci-dessous
            </p>
            <div className="mt-4">
              <FileDropzone
                accept="video/mp4,video/quicktime,video/x-matroska"
                multiple
                label="Ajouter des vidéos"
                hint="MP4, MOV, MKV · plusieurs fichiers"
                className="min-h-[200px]"
                onFiles={(picked) => {
                  setFiles(picked);
                  clearResults();
                }}
              />
            </div>
            {files.length > 0 ? (
              <ul className="mt-4 space-y-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-3">
                {files.map((f) => (
                  <li key={f.name} className="truncate text-xs k-text-secondary">
                    {f.name}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <label className="block text-xs k-text-muted">
            Copies par vidéo
            <input
              type="number"
              min={1}
              max={10}
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="mt-1 h-9 w-full k-input px-2"
            />
          </label>

          <button
            type="button"
            disabled={busy || loading}
            onClick={handleGenerate}
            className="k-btn-primary h-10 w-full disabled:opacity-50"
          >
            {busy || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Générer les variantes
          </button>

          {(busy || loading) && (
            <p className="text-xs k-text-muted">
              {loading ? "Chargement FFmpeg…" : `Traitement… ${progress}%`}
            </p>
          )}
          {log ? (
            <p className="truncate text-[10px] k-text-faint">{log}</p>
          ) : null}
          {message ? (
            <p className="text-xs k-text-secondary">{message}</p>
          ) : null}
        </div>

        <RepurposeSettingsPanel
          settings={settings}
          onChange={setSettings}
          watermarkFile={watermarkFile}
          onWatermarkFile={setWatermarkFile}
        />
      </div>

      {results.length > 0 ? (
        <section className="k-card-glow mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="k-label mb-1">Résultats</p>
              <h2 className="k-subheading">{results.length} variante(s)</h2>
            </div>
            <span className="k-badge">{results.length} MP4</span>
          </div>

          <ul className="mt-4 max-h-64 space-y-1.5 overflow-y-auto">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => downloadBlob(item.blob, item.filename)}
                  className="k-list-item w-full text-left"
                >
                  <span className="text-sm font-medium k-link">
                    {item.filename}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={downloadingZip}
            onClick={() => void handleDownloadZip()}
            className="k-btn-primary mt-4 h-11 w-full disabled:opacity-50 sm:w-auto"
          >
            {downloadingZip ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Package className="h-4 w-4" />
            )}
            Télécharger tout en ZIP
          </button>
        </section>
      ) : null}

      {getToolGuide("/repurpose") ? (
        <ToolTutorial
          guide={getToolGuide("/repurpose")!}
          showStatus={false}
          className="mt-6"
        />
      ) : null}
    </ToolPage>
  );
}
