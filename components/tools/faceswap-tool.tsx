"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { LimitationBanner } from "@/components/shell/limitation-banner";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { getToolGuide } from "@/lib/tool-guides";

export function FaceSwapTool() {
  const [source, setSource] = useState<File | null>(null);
  const [target, setTarget] = useState<File | null>(null);

  return (
    <ToolPage
      title="Face Swap"
      subtitle="Échange de visages sur image ou courte vidéo."
    >
      <LimitationBanner title="Non disponible sur le web">
        TikFusion desktop envoie tes fichiers à une API cloud propriétaire (AWS).
        Cette clé API n&apos;est pas incluse ici pour des raisons de sécurité et
        de licence. Pour utiliser le Face Swap, il faut brancher ta propre API
        backend ou utiliser la version desktop TikFusion.
      </LimitationBanner>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-[#86868b]">Visage source</p>
          <FileDropzone
            accept="image/png,image/jpeg"
            label="Image source (visage)"
            onFiles={(f) => setSource(f[0] ?? null)}
          />
        </div>
        <div>
          <p className="mb-2 text-xs text-[#86868b]">Cible</p>
          <FileDropzone
            accept="image/png,image/jpeg,video/mp4"
            label="Image ou vidéo cible (≤ 15 s)"
            onFiles={(f) => setTarget(f[0] ?? null)}
          />
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-4 h-10 cursor-not-allowed rounded-xl border border-[rgba(0,122,255,0.1)] bg-[#f5f5f7] px-4 text-sm text-[#aeaeb2]"
      >
        API Face Swap non configurée
      </button>

      {(source || target) && (
        <p className="mt-3 text-xs text-[#aeaeb2]">
          Fichiers sélectionnés : {source?.name ?? "—"} → {target?.name ?? "—"}
        </p>
      )}

      {getToolGuide("/faceswap") ? (
        <ToolTutorial guide={getToolGuide("/faceswap")!} className="mt-6" />
      ) : null}
    </ToolPage>
  );
}
