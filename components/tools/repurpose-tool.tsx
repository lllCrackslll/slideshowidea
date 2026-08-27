"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { RepurposeSettingsPanel } from "@/components/repurpose/repurpose-settings-panel";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { LimitationBanner } from "@/components/shell/limitation-banner";
import { ToolPage } from "@/components/shell/tool-page";
import { useFfmpeg } from "@/hooks/use-ffmpeg";
import { downloadBlob } from "@/lib/image-processing";
import {
  DEFAULT_REPURPOSE_SETTINGS,
  allPresets,
  deleteCustomPreset,
  saveCustomPreset,
} from "@/lib/repurpose/presets";
import type { RepurposeSettings } from "@/lib/repurpose/types";

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

  const { loading, progress, log, repurpose, load } = useFfmpeg();

  const presets = useMemo(() => allPresets(), [presetName, customPresetName]);

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

    try {
      await load();
      let done = 0;
      const total = files.length * copies;

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
          downloadBlob(blob, `${base}-repurpose-${suffix}.mp4`);
          done += 1;
          setMessage(`Variante ${done}/${total}…`);
        }
      }

      setMessage(`${total} variante(s) téléchargée(s).`);
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
    setPresetName(name);
    setCustomPresetName("");
    setMessage(`Preset « ${name} » sauvegardé.`);
  }

  function handleDeletePreset() {
    if (presetName in presets && !(presetName in { "Instagram Preset": 1, "TikTok Preset": 1 })) {
      deleteCustomPreset(presetName);
      applyPreset("Instagram Preset");
      setMessage(`Preset « ${presetName} » supprimé.`);
    }
  }

  return (
    <ToolPage
      title="Repurpose Bot"
      subtitle="Variantes uniques — filtres, presets, watermark, metadata US."
    >
      <LimitationBanner title="Version web (FFmpeg WASM)">
        Tous les filtres TikFusion desktop sont disponibles ici. Limites restantes :
        pas de tonemap HDR auto, traitement plus lent que l&apos;app Electron, vidéos
        longues ou lourdes peuvent échouer (garde &lt; 60 s / &lt; 50 Mo). Les
        fichiers se téléchargent au lieu d&apos;aller dans un dossier local.
      </LimitationBanner>

      <div className="mb-4 flex flex-wrap items-end gap-2">
        <label className="text-xs text-zinc-400">
          Preset
          <select
            value={presetName}
            onChange={(e) => applyPreset(e.target.value)}
            className="mt-1 block h-9 min-w-[160px] rounded-lg border border-[#27272a] bg-[#0c0c0e] px-2 text-sm text-zinc-100"
          >
            {Object.keys(presets).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-zinc-400">
          Sauver preset as
          <input
            value={customPresetName}
            onChange={(e) => setCustomPresetName(e.target.value)}
            placeholder="Mon preset"
            className="mt-1 block h-9 w-36 rounded-lg border border-[#27272a] bg-transparent px-2 text-sm text-zinc-100"
          />
        </label>
        <button
          type="button"
          onClick={handleSavePreset}
          className="h-9 rounded-lg border border-[#27272a] px-3 text-xs text-zinc-300 hover:bg-white/[0.03]"
        >
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={handleDeletePreset}
          className="h-9 rounded-lg border border-[#27272a] px-3 text-xs text-zinc-500 hover:bg-white/[0.03]"
        >
          Supprimer preset
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <FileDropzone
            accept="video/mp4,video/quicktime,video/x-matroska"
            multiple
            label="Vidéos (multi)"
            hint="MP4, MOV, MKV"
            onFiles={(picked) => setFiles(picked)}
          />
          {files.length > 0 ? (
            <ul className="space-y-1 text-[10px] text-zinc-600">
              {files.map((f) => (
                <li key={f.name} className="truncate">
                  {f.name}
                </li>
              ))}
            </ul>
          ) : null}

          <label className="block text-xs text-zinc-400">
            Copies par vidéo
            <input
              type="number"
              min={1}
              max={10}
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="mt-1 h-9 w-full rounded-lg border border-[#27272a] bg-transparent px-2 text-zinc-100"
            />
          </label>

          <button
            type="button"
            disabled={busy || loading}
            onClick={handleGenerate}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 text-sm font-medium text-zinc-950 disabled:opacity-50"
          >
            {busy || loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Générer les variantes
          </button>

          {(busy || loading) && (
            <p className="text-xs text-zinc-400">
              {loading ? "Chargement FFmpeg…" : `Traitement… ${progress}%`}
            </p>
          )}
          {log ? (
            <p className="truncate text-[10px] text-zinc-600">{log}</p>
          ) : null}
          {message ? (
            <p className="text-xs text-zinc-300">{message}</p>
          ) : null}
        </div>

        <RepurposeSettingsPanel
          settings={settings}
          onChange={setSettings}
          watermarkFile={watermarkFile}
          onWatermarkFile={setWatermarkFile}
        />
      </div>
    </ToolPage>
  );
}
