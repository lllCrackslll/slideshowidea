"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { LimitationBanner } from "@/components/shell/limitation-banner";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { compareImagesSimilarity } from "@/lib/image-processing";
import { getToolGuide } from "@/lib/tool-guides";

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
          <p className="mb-2 text-xs text-[#86868b]">Fichier A</p>
          <FileDropzone
            label="Fichier A"
            accept="image/*,video/*"
            onFiles={(f) => setFileA(f[0] ?? null)}
          />
          {fileA ? (
            <p className="mt-1 truncate text-[10px] text-[#aeaeb2]">
              {fileA.name}
            </p>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-xs text-[#86868b]">Fichier B</p>
          <FileDropzone
            label="Fichier B"
            accept="image/*,video/*"
            onFiles={(f) => setFileB(f[0] ?? null)}
          />
          {fileB ? (
            <p className="mt-1 truncate text-[10px] text-[#aeaeb2]">
              {fileB.name}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        disabled={!fileA || !fileB || busy}
        onClick={compare}
        className="k-btn-primary mt-4 h-10 disabled:opacity-50"
      >
        Comparer
      </button>

      {score !== null ? (
        <div className="mt-4 k-card">
          <p className="text-xs text-[#86868b]">Similarité estimée</p>
          <p className="text-3xl font-semibold text-[#1d1d1f]">
            {score.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-[#86868b]">
            {score > 85
              ? "Très similaires — risque de doublon."
              : score > 60
                ? "Assez proches."
                : "Plutôt différents."}
          </p>
        </div>
      ) : null}

      {getToolGuide("/detector") ? (
        <ToolTutorial guide={getToolGuide("/detector")!} className="mt-6" />
      ) : null}
    </ToolPage>
  );
}
