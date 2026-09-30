"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { renderCaptionOverlay } from "@/lib/caption-overlay";
import {
  CAPTION_FONTS,
  DEFAULT_CAPTION_FONT_ID,
  DEFAULT_CAPTION_SIZE,
  MAX_CAPTION_SIZE,
  MIN_CAPTION_SIZE,
  getCaptionFont,
  type CaptionFontId,
} from "@/lib/caption-fonts";
import {
  canvasToBlob,
  downloadBlob,
  loadImageFile,
} from "@/lib/image-processing";
import { getToolGuide } from "@/lib/tool-guides";

export function CaptionTool() {
  const guide = getToolGuide("/texte");
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [fontId, setFontId] = useState<CaptionFontId>(DEFAULT_CAPTION_FONT_ID);
  const [fontSize, setFontSize] = useState(DEFAULT_CAPTION_SIZE);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFiles(files: File[]) {
    const next = files.find((item) => item.type.startsWith("image/"));
    if (!next) return;
    setFile(next);
    setPreview(null);
    setMessage(null);
  }

  async function generate() {
    if (!file) return;
    const text = caption.trim();
    if (!text) {
      setMessage("Écris une caption avant de générer.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const font = getCaptionFont(fontId);
      await document.fonts.load(`${font.weight} 64px ${font.family}`);
      const img = await loadImageFile(file);
      const canvas = renderCaptionOverlay(img, text, { font, size: fontSize });
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
      const url = URL.createObjectURL(blob);
      setPreview((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      downloadBlob(blob, `texte-${file.name.replace(/\.[^.]+$/, "")}.jpg`);
      setMessage("Image générée et téléchargée.");
    } catch {
      setMessage("Génération impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage
      title="Texte"
      subtitle="Ajoute une caption sur ton image, style TikTok."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <FileDropzone
            accept="image/png,image/jpeg,image/webp"
            label="Image"
            hint="PNG, JPG ou WebP"
            onFiles={(files) => void handleFiles(files)}
          />

          {file ? (
            <p className="text-xs k-text-muted">
              {file.name}
            </p>
          ) : null}

          <div className="sr-only" aria-hidden>
            {CAPTION_FONTS.map((font) =>
              font.className ? (
                <span key={font.id} className={font.className}>
                  {font.label}
                </span>
              ) : null,
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="k-label mb-1 block">Police</span>
              <select
                value={fontId}
                onChange={(e) => setFontId(e.target.value as CaptionFontId)}
                className="k-input h-10 w-full"
                style={{ fontFamily: getCaptionFont(fontId).family }}
              >
                {CAPTION_FONTS.map((font) => (
                  <option key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                    {font.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="k-label mb-1 flex justify-between">
                <span>Taille</span>
                <span>{fontSize}</span>
              </span>
              <input
                type="range"
                min={MIN_CAPTION_SIZE}
                max={MAX_CAPTION_SIZE}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="mt-3 w-full accent-[#007aff]"
              />
            </label>
          </div>

          <label className="block">
            <span className="k-label mb-1 block">Caption</span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={"Ta phrase ici\nRetour à la ligne = nouvelle ligne"}
              rows={4}
              className="k-input min-h-28 w-full resize-y py-3"
              style={{ fontFamily: getCaptionFont(fontId).family }}
            />
          </label>

          <button
            type="button"
            disabled={!file || busy}
            onClick={() => void generate()}
            className="flex h-10 w-full items-center justify-center gap-2 k-btn-primary disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Générer
          </button>

          {message ? <p className="text-xs k-text-muted">{message}</p> : null}
        </div>

        <div className="k-card flex min-h-[280px] flex-col items-center justify-center">
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Image avec caption"
                className="max-h-[520px] max-w-full rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = preview;
                  link.download = `texte-${file?.name.replace(/\.[^.]+$/, "") ?? "image"}.jpg`;
                  link.click();
                }}
                className="k-btn-secondary mt-4"
              >
                <Download className="h-3.5 w-3.5" />
                Télécharger
              </button>
            </>
          ) : (
            <p className="text-xs k-text-faint">L&apos;image générée s&apos;affiche ici</p>
          )}
        </div>
      </div>

      {guide ? <ToolTutorial guide={guide} className="mt-6" /> : null}
    </ToolPage>
  );
}
