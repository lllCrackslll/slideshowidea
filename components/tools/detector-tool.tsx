"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { LimitationBanner } from "@/components/shell/limitation-banner";
import { ToolPage } from "@/components/shell/tool-page";
import { compareImagesSimilarity } from "@/lib/image-processing";

export function DetectorTool() {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function compare() {
    if (!fileA || !fileB) return;
    setBusy(true);
    try {
      if (
        fileA.type.startsWith("video/") ||
        fileB.type.startsWith("video/")
      ) {
        setScore(null);
        alert(
          "SSIM vidéo non disponible sur le web. Utilise deux images, ou la version desktop TikFusion.",
        );
        return;
      }
      const result = await compareImagesSimilarity(fileA, fileB);
      setScore(result);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      title="Similarity Detector"
      subtitle="Estime si deux fichiers sont visuellement proches."
    >
      <LimitationBanner title="Approximation web">
        TikFusion desktop calcule un vrai score SSIM via FFmpeg. Ici, comparaison
        pixel sur images uniquement (pas de vidéo). Résultat indicatif, pas
        identique au desktop.
      </LimitationBanner>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-zinc-500">Fichier A</p>
          <FileDropzone
            label="Fichier A"
            accept="image/*,video/*"
            onFiles={(f) => setFileA(f[0] ?? null)}
          />
          {fileA ? (
            <p className="mt-1 truncate text-[10px] text-zinc-600">
              {fileA.name}
            </p>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-xs text-zinc-500">Fichier B</p>
          <FileDropzone
            label="Fichier B"
            accept="image/*,video/*"
            onFiles={(f) => setFileB(f[0] ?? null)}
          />
          {fileB ? (
            <p className="mt-1 truncate text-[10px] text-zinc-600">
              {fileB.name}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        disabled={!fileA || !fileB || busy}
        onClick={compare}
        className="mt-4 h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 disabled:opacity-50"
      >
        Comparer
      </button>

      {score !== null ? (
        <div className="mt-4 rounded-xl border border-[#27272a] bg-[#0c0c0e] p-4">
          <p className="text-xs text-zinc-500">Similarité estimée</p>
          <p className="text-3xl font-semibold text-zinc-100">
            {score.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {score > 85
              ? "Très similaires — risque de doublon."
              : score > 60
                ? "Assez proches."
                : "Plutôt différents."}
          </p>
        </div>
      ) : null}
    </ToolPage>
  );
}
