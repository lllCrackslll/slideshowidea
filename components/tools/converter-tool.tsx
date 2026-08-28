"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { getToolGuide } from "@/lib/tool-guides";
import {
  canvasToBlob,
  downloadBlob,
  loadImageFile,
} from "@/lib/image-processing";

export function ConverterTool() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function convertImage(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const img = await loadImageFile(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, "")}.jpg`);
      setMessage("Image convertie en JPEG.");
    } catch {
      setMessage("Conversion image impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage title="Converter" subtitle="PNG / WebP → JPEG instantané.">
      <FileDropzone
        accept="image/png,image/jpeg,image/webp"
        label="Déposer une image"
        hint="Conversion automatique en JPEG"
        onFiles={async (files) => {
          const file = files[0];
          if (file) await convertImage(file);
        }}
      />

      {busy ? <p className="mt-3 text-xs k-text-muted">Traitement…</p> : null}
      {message ? <p className="mt-3 text-xs k-text-secondary">{message}</p> : null}

      {getToolGuide("/converter") ? (
        <ToolTutorial guide={getToolGuide("/converter")!} className="mt-6" />
      ) : null}
    </ToolPage>
  );
}
