"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import {
  canvasToBlob,
  downloadBlob,
  loadImageFile,
} from "@/lib/image-processing";
import { getToolGuide } from "@/lib/tool-guides";

export function ReducerTool() {
  const [quality, setQuality] = useState(70);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function reduce(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const img = await loadImageFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
      const kbBefore = (file.size / 1024).toFixed(0);
      const kbAfter = (blob.size / 1024).toFixed(0);
      downloadBlob(blob, `reduced-${file.name.replace(/\.[^.]+$/, "")}.jpg`);
      setMessage(`${kbBefore} Ko → ${kbAfter} Ko (qualité ${quality}%).`);
    } catch {
      setMessage("Réduction impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      title="File Reducer"
      subtitle="Compresse tes images en JPEG léger."
    >
      <label className="mb-4 block text-xs k-text-muted">
        Qualité JPEG ({quality}%)
        <input
          type="range"
          min={30}
          max={95}
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="mt-2 w-full max-w-md accent-[#007aff]"
        />
      </label>

      <FileDropzone
        accept="image/png,image/jpeg,image/webp"
        label="Image à réduire"
        onFiles={(files) => {
          const file = files[0];
          if (file) void reduce(file);
        }}
      />

      {busy ? <p className="mt-3 text-xs k-text-muted">Traitement…</p> : null}
      {message ? <p className="mt-3 text-xs k-text-secondary">{message}</p> : null}

      {getToolGuide("/reducer") ? (
        <ToolTutorial guide={getToolGuide("/reducer")!} className="mt-6" />
      ) : null}
    </ToolPage>
  );
}
