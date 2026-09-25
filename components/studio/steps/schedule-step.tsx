"use client";

import { Clapperboard, Images, Loader2, Package, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCampaignMedia, setCampaignMedia } from "@/lib/workspace/campaign-media";
import { downloadSlidesZip } from "@/lib/workspace/export-slides";
import { fileToDataUrl } from "@/lib/workspace/image-utils";
import type { PublishFormat } from "@/lib/workspace/types";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

export function ScheduleStep() {
  const { campaign, updateCampaign, setStep } = useWorkspace();
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const campaignId = campaign?.id;

  useEffect(() => {
    if (!campaign) return;
    setCaption(campaign.caption ?? "");
    setHashtagText(campaign.hashtags?.join(" ") ?? "");
  }, [campaignId]);

  if (!campaign) {
    return (
      <section className="k-card">
        <CampaignPicker />
      </section>
    );
  }

  const c = campaign;
  const publishAsVideo = c.publishFormat === "video";
  const format: PublishFormat = publishAsVideo ? "video" : "carousel";
  const files = getCampaignMedia(c, format);

  async function setPublishFormat(next: PublishFormat) {
    await updateCampaign({ ...c, publishFormat: next });
  }

  async function addFiles(fileList: FileList) {
    const urls = await Promise.all(Array.from(fileList).map((f) => fileToDataUrl(f)));
    const current = getCampaignMedia(c, format);
    const next = publishAsVideo ? urls.slice(0, 1) : [...current, ...urls];
    await updateCampaign(setCampaignMedia(c, next, format));
  }

  function removeFile(index: number) {
    const next = getCampaignMedia(c, format).filter((_, i) => i !== index);
    void updateCampaign(setCampaignMedia(c, next, format));
  }

  async function saveMeta() {
    const hashtags = hashtagText
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
    await updateCampaign({
      ...c,
      caption: caption.trim(),
      hashtags,
      status: "ready",
    });
    setMsg("Métadonnées enregistrées.");
  }

  async function exportZip() {
    setExporting(true);
    setMsg(null);
    const fullCaption = [caption.trim(), hashtagText.trim()].filter(Boolean).join("\n");
    try {
      const exported = await downloadSlidesZip({
        campaignName: c.name,
        caption: fullCaption,
        getImages: () => (publishAsVideo ? [] : getCampaignMedia(c, "carousel")),
        getVideos: () => (publishAsVideo ? getCampaignMedia(c, "video") : []),
      });
      if (!exported) {
        setMsg(publishAsVideo ? "Ajoute une vidéo" : "Ajoute des images");
        return;
      }
      await updateCampaign({
        ...c,
        caption: caption.trim(),
        hashtags: hashtagText
          .split(/[\s,]+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
        status: "published",
      });
      setMsg("ZIP exporté — prêt à publier sur TikTok.");
    } catch {
      setMsg("Erreur export");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="k-card">
      <h2 className="k-subheading">Exporter</h2>
      <p className="mt-1 text-sm k-text-muted">Prépare le pack final (ZIP) avec légende et médias</p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
      </div>

      <div className="k-row mt-4 space-y-3">
        <label className="block">
          <span className="k-label mb-1 block">Description / légende</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            placeholder="Texte du post TikTok…"
            className="k-input w-full resize-y px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="k-label mb-1 block">Hashtags</span>
          <input
            value={hashtagText}
            onChange={(e) => setHashtagText(e.target.value)}
            placeholder="#app #fyp"
            className="k-input h-10 w-full px-3 text-sm"
          />
        </label>
      </div>

      <label className="k-row mt-4 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={publishAsVideo}
          onChange={(e) => void setPublishFormat(e.target.checked ? "video" : "carousel")}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        <span className="flex items-center gap-2 text-sm k-text">
          <Clapperboard className="h-4 w-4 k-accent" />
          Pack vidéo
        </span>
        {!publishAsVideo ? (
          <span className="ml-auto flex items-center gap-1 text-xs k-text-muted">
            <Images className="h-3.5 w-3.5" />
            Carrousel
          </span>
        ) : null}
      </label>

      <div className="mt-5 flex items-center justify-between gap-2">
        <p className="text-sm font-medium k-text">{publishAsVideo ? "Vidéo" : "Images"}</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="k-btn-ghost py-1">
          <Plus className="h-3.5 w-3.5" />
          Ajouter
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={
            publishAsVideo
              ? "video/mp4,video/quicktime,video/webm"
              : "image/jpeg,image/png,image/webp"
          }
          multiple={!publishAsVideo}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length ? (
        publishAsVideo ? (
          <div className="relative mt-3 aspect-[9/16] max-w-[160px] overflow-hidden rounded-lg border border-[var(--border)]">
            <video src={files[0]} className="h-full w-full object-cover" controls muted />
            <button
              type="button"
              onClick={() => removeFile(0)}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {files.map((url, i) => (
              <li
                key={`file-${i}`}
                className="relative aspect-[9/16] overflow-hidden rounded-lg border border-[var(--border)]"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <p className="mt-3 text-xs k-text-muted">
          {publishAsVideo ? "Aucune vidéo" : "Aucune image"}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button type="button" onClick={() => void saveMeta()} className="k-btn-ghost flex-1">
          Enregistrer légende
        </button>
        <button
          type="button"
          disabled={exporting || !files.length}
          onClick={() => void exportZip()}
          className="k-btn-primary flex-1"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
          Exporter ZIP
        </button>
      </div>

      {msg ? (
        <p
          className={`mt-3 text-center text-xs ${msg.includes("Erreur") || msg.includes("Ajoute") ? "text-red-500" : "k-accent"}`}
        >
          {msg}
        </p>
      ) : null}

      <button type="button" onClick={() => setStep("analytics")} className="k-btn-ghost mx-auto mt-4 block">
        Voir stats →
      </button>
    </section>
  );
}
