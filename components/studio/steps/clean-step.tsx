"use client";

import { Download, Loader2, Plus, ShieldCheck, X } from "lucide-react";
import { useRef, useState } from "react";
import { getCampaignMedia, setCampaignMedia } from "@/lib/workspace/campaign-media";
import { downloadSlidesZip } from "@/lib/workspace/export-slides";
import { fileToDataUrl } from "@/lib/workspace/image-utils";
import { cleanAllSlides } from "@/lib/workspace/slide-clean";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

export function CleanStep() {
  const { campaign, updateCampaign } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(Boolean(campaign?.cleanedAt));
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!campaign) {
    return (
      <section className="k-card">
        <CampaignPicker />
      </section>
    );
  }

  const c = campaign;
  const images = getCampaignMedia(c, "carousel");

  async function addImages(files: FileList) {
    const urls = await Promise.all(Array.from(files).map((f) => fileToDataUrl(f)));
    await updateCampaign(setCampaignMedia(c, [...images, ...urls], "carousel"));
    setDone(false);
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    void updateCampaign(setCampaignMedia(c, next, "carousel"));
    setDone(false);
  }

  async function runClean() {
    if (!images.length) return;

    setBusy(true);
    try {
      const cleaned = await cleanAllSlides(images);
      await updateCampaign({
        ...setCampaignMedia(c, cleaned, "carousel"),
        importedAsIs: true,
        status: "ready",
        cleanedAt: new Date().toISOString(),
      });
      setDone(true);
      setMsg(null);
    } finally {
      setBusy(false);
    }
  }

  async function downloadSlides() {
    setExporting(true);
    setMsg(null);
    try {
      const exported = await downloadSlidesZip({
        campaignName: c.name,
        caption: [c.caption, c.hashtags?.join(" ")].filter(Boolean).join("\n"),
        getImages: () => getCampaignMedia(c, "carousel"),
      });
      if (!exported) {
        setMsg("Aucune slide à télécharger.");
        return;
      }
      setMsg("ZIP téléchargé.");
    } catch {
      setMsg("Erreur lors du téléchargement.");
    } finally {
      setExporting(false);
    }
  }

  const canDownload = images.length > 0 && Boolean(c.cleanedAt);

  return (
    <section className="k-card">
      <h2 className="k-subheading">Clean</h2>
      <p className="mt-1 text-sm k-text-muted">Prépare tes slides avant export ou publication</p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <p className="text-sm font-medium k-text">Slides</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="k-btn-ghost py-1">
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void addImages(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length ? (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((url, i) => (
            <li
              key={`slide-${i}`}
              className="relative aspect-[9/16] overflow-hidden rounded-lg border border-[var(--border)]"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="k-slide-slot-empty mt-3 w-full max-w-[120px]"
        >
          <Plus className="h-5 w-5 k-text-muted" />
          <span className="text-[10px] k-text-muted">Slides</span>
        </button>
      )}

      <p className="mt-4 text-center text-xs k-text-muted">{images.length} slide{images.length > 1 ? "s" : ""}</p>

      <div className="mx-auto mt-4 flex w-full max-w-md flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={busy || !images.length}
          onClick={() => void runClean()}
          className="k-btn-primary flex-1"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {done ? "Re-clean" : "Lancer le clean"}
        </button>
        <button
          type="button"
          disabled={exporting || !canDownload}
          onClick={() => void downloadSlides()}
          className="k-btn-accent flex-1"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Télécharger ZIP
        </button>
      </div>

      {done ? <p className="mt-3 text-center text-xs k-accent">Clean terminé</p> : null}
      {msg ? (
        <p
          className={`mt-2 text-center text-xs ${msg.includes("Erreur") || msg.includes("Aucune") ? "text-red-500" : "k-accent"}`}
        >
          {msg}
        </p>
      ) : null}
      {!canDownload && images.length > 0 ? (
        <p className="mt-2 text-center text-xs k-text-muted">Lance le clean pour activer le téléchargement.</p>
      ) : null}
    </section>
  );
}
