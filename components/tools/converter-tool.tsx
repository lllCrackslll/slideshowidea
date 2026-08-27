"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { useFfmpeg } from "@/hooks/use-ffmpeg";
import { getToolGuide } from "@/lib/tool-guides";
import {
  canvasToBlob,
  downloadBlob,
  loadImageFile,
} from "@/lib/image-processing";

type ConverterTab = "image" | "video" | "gif";

export function ConverterTool() {
  const [tab, setTab] = useState<ConverterTab>("image");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { loading, progress, log, run, load } = useFfmpeg();

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

  async function convertVideo(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      await load();
      const blob = await run(file.name, file, "output.mp4", [
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "23",
        "-c:a",
        "aac",
      ]);
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, "")}.mp4`);
      setMessage("Vidéo convertie en MP4.");
    } catch {
      setMessage(
        "Conversion vidéo impossible. Utilise un fichier court (< 30 s).",
      );
    } finally {
      setBusy(false);
    }
  }

  async function convertGif(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      await load();
      const blob = await run(file.name, file, "output.gif", [
        "-vf",
        "fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
      ]);
      downloadBlob(blob, `${file.name.replace(/\.[^.]+$/, "")}.gif`);
      setMessage("GIF généré.");
    } catch {
      setMessage("Conversion GIF impossible.");
    } finally {
      setBusy(false);
    }
  }

  const tabs: { id: ConverterTab; label: string }[] = [
    { id: "image", label: "Image" },
    { id: "video", label: "Video" },
    { id: "gif", label: "GIF" },
  ];

  return (
    <ToolPage title="Converter" subtitle="Convertit images, vidéos et GIF.">
      <div className="mb-4 k-tab-bar">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`k-tab ${tab === t.id ? "k-tab-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "image" ? (
        <p className="mb-4 text-xs text-[#86868b]">
          FFmpeg WASM — premier chargement ~30 Mo. Vidéos courtes recommandées.
        </p>
      ) : null}

      <FileDropzone
        accept={
          tab === "image"
            ? "image/png,image/jpeg,image/webp"
            : "video/mp4,video/quicktime,video/x-matroska"
        }
        label={`Déposer ${tab === "image" ? "une image" : "une vidéo"}`}
        onFiles={async (files) => {
          const file = files[0];
          if (!file) return;
          if (tab === "image") await convertImage(file);
          else if (tab === "video") await convertVideo(file);
          else await convertGif(file);
        }}
      />

      {(busy || loading) && (
        <p className="mt-3 text-xs text-[#86868b]">
          {loading ? "Chargement FFmpeg…" : `Traitement… ${progress}%`}
        </p>
      )}
      {log && tab !== "image" ? (
        <p className="mt-1 truncate text-[10px] text-[#aeaeb2]">{log}</p>
      ) : null}
      {message ? <p className="mt-3 text-xs text-[#424245]">{message}</p> : null}

      {getToolGuide("/converter") ? (
        <ToolTutorial guide={getToolGuide("/converter")!} className="mt-6" />
      ) : null}
    </ToolPage>
  );
}
