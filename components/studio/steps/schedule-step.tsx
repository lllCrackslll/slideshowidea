"use client";

import { Clapperboard, Images, Loader2, Package, Plus, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import JSZip from "jszip";
import { fileToDataUrl } from "@/lib/workspace/image-utils";
import {
  bumpMetrics,
  loadSchedule,
  saveSchedule,
} from "@/lib/workspace/storage";
import type { Campaign, PublishFormat, ScheduledPost } from "@/lib/workspace/types";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

function folderSlug(label: string) {
  return (
    label
      .replace(/^@/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32) || "compte"
  );
}

function getAccountFiles(campaign: Campaign, accountId: string, format: PublishFormat): string[] {
  if (format === "video") {
    return campaign.accountVideos?.[accountId] ?? [];
  }
  return campaign.accountMedia?.[accountId] ?? [];
}

function setAccountFiles(
  campaign: Campaign,
  accountId: string,
  urls: string[],
  format: PublishFormat,
): Campaign {
  if (format === "video") {
    return {
      ...campaign,
      accountVideos: { ...campaign.accountVideos, [accountId]: urls },
    };
  }
  return {
    ...campaign,
    accountMedia: { ...campaign.accountMedia, [accountId]: urls },
  };
}

async function urlToBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const res = await fetch(url);
    return res.blob();
  }
  const res = await fetch(`/api/sourcing/image?url=${encodeURIComponent(url)}`);
  return res.blob();
}

function extFromBlob(blob: Blob, fallback: string) {
  if (blob.type.includes("mp4")) return "mp4";
  if (blob.type.includes("webm")) return "webm";
  if (blob.type.includes("jpeg") || blob.type.includes("jpg")) return "jpg";
  if (blob.type.includes("png")) return "png";
  return fallback;
}

export function ScheduleStep() {
  const { workspace, campaign, accounts, updateCampaign, setStep } = useWorkspace();
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!workspace) return null;

  if (!campaign) {
    return (
      <section className="k-card">
        <CampaignPicker />
      </section>
    );
  }

  const c = campaign;
  const ws = workspace;
  const publishAsVideo = c.publishFormat === "video";

  async function setPublishFormat(format: PublishFormat) {
    await updateCampaign({ ...c, publishFormat: format });
  }

  async function addFiles(accountId: string, files: FileList) {
    const urls = await Promise.all(Array.from(files).map((f) => fileToDataUrl(f)));
    const current = getAccountFiles(c, accountId, publishAsVideo ? "video" : "carousel");
    await updateCampaign(
      setAccountFiles(c, accountId, [...current, ...urls], publishAsVideo ? "video" : "carousel"),
    );
  }

  function removeFile(accountId: string, index: number) {
    const format = publishAsVideo ? "video" : "carousel";
    const next = getAccountFiles(c, accountId, format).filter((_, i) => i !== index);
    void updateCampaign(setAccountFiles(c, accountId, next, format));
  }

  async function exportZip() {
    setExporting(true);
    setMsg(null);
    const format = publishAsVideo ? "video" : "carousel";
    try {
      const zip = new JSZip();
      let exported = 0;

      for (const acc of accounts) {
        const files = getAccountFiles(c, acc.id, format);
        if (!files.length) continue;
        const root = zip.folder(folderSlug(acc.label));
        if (!root) continue;

        if (format === "video") {
          const blob = await urlToBlob(files[0]);
          root.file(`video.${extFromBlob(blob, "mp4")}`, blob);
        } else {
          for (let i = 0; i < files.length; i += 1) {
            const blob = await urlToBlob(files[i]);
            root.file(`slide-${i + 1}.${extFromBlob(blob, "jpg")}`, blob);
          }
        }

        root.file(
          "caption.txt",
          [c.caption, acc.promoCode && `Code: ${acc.promoCode}`].filter(Boolean).join("\n"),
        );
        exported += 1;
      }

      if (!exported) {
        setMsg(publishAsVideo ? "Ajoute une vidéo par compte" : "Ajoute des images par compte");
        return;
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${c.name.slice(0, 24)}.zip`;
      a.click();
      setMsg(`${exported} compte${exported > 1 ? "s" : ""} exporté${exported > 1 ? "s" : ""}`);
    } catch {
      setMsg("Erreur export");
    } finally {
      setExporting(false);
    }
  }

  async function schedule() {
    const format = publishAsVideo ? "video" : "carousel";
    const posts: ScheduledPost[] = [];
    accounts.forEach((acc, i) => {
      if (!getAccountFiles(c, acc.id, format).length) return;
      const d = new Date();
      d.setHours(acc.publishHour, acc.publishMinute + i * 30, 0, 0);
      posts.push({
        id: `post-${Date.now()}-${i}`,
        campaignId: c.id,
        accountId: acc.id,
        scheduledAt: d.toISOString(),
        format,
        status: "queued",
      });
    });

    if (!posts.length) {
      setMsg(publishAsVideo ? "Ajoute une vidéo par compte" : "Ajoute des images par compte");
      return;
    }

    saveSchedule(ws.id, [...loadSchedule(ws.id), ...posts]);
    await updateCampaign({ ...c, status: "scheduled" });
    posts.forEach((p) => bumpMetrics(ws.id, p.accountId));
    setMsg(`${posts.length} publication${posts.length > 1 ? "s" : ""} lancée${posts.length > 1 ? "s" : ""}`);
  }

  const filledAccounts = accounts.filter((a) =>
    getAccountFiles(c, a.id, publishAsVideo ? "video" : "carousel").length > 0,
  ).length;

  return (
    <section className="k-card">
      <h2 className="k-subheading">Publier</h2>
      <p className="mt-1 text-sm k-text-muted">
        Carrousel ou vidéo · un pack par compte
      </p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
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
          Publier en vidéo
        </span>
        {!publishAsVideo ? (
          <span className="ml-auto flex items-center gap-1 text-xs k-text-muted">
            <Images className="h-3.5 w-3.5" />
            Carrousel
          </span>
        ) : null}
      </label>

      {!accounts.length ? (
        <p className="mt-4 text-sm k-text-muted">
          Ajoute des comptes dans{" "}
          <a href="/setup" className="k-link">
            Comptes
          </a>
          .
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {accounts.map((acc) => {
            const files = getAccountFiles(c, acc.id, publishAsVideo ? "video" : "carousel");
            return (
              <li key={acc.id} className="k-row">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium k-text">{acc.label}</p>
                  <button
                    type="button"
                    onClick={() => inputRefs.current[acc.id]?.click()}
                    className="k-btn-ghost py-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {publishAsVideo ? "Vidéo" : "Images"}
                  </button>
                  <input
                    ref={(el) => {
                      inputRefs.current[acc.id] = el;
                    }}
                    type="file"
                    accept={
                      publishAsVideo
                        ? "video/mp4,video/quicktime,video/webm"
                        : "image/jpeg,image/png,image/webp"
                    }
                    multiple={!publishAsVideo}
                    className="sr-only"
                    onChange={(e) => {
                      if (e.target.files?.length) void addFiles(acc.id, e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {files.length ? (
                  publishAsVideo ? (
                    <div className="relative aspect-[9/16] max-w-[160px] overflow-hidden rounded-lg border border-[var(--border)]">
                      <video src={files[0]} className="h-full w-full object-cover" controls muted />
                      <button
                        type="button"
                        onClick={() => removeFile(acc.id, 0)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {files.map((url, i) => (
                        <li
                          key={`${acc.id}-${i}`}
                          className="relative aspect-[9/16] overflow-hidden rounded-lg border border-[var(--border)]"
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(acc.id, i)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <p className="text-xs k-text-muted">
                    {publishAsVideo ? "Aucune vidéo" : "Aucune image"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-center text-xs k-text-muted">
        {filledAccounts}/{accounts.length} comptes prêts
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={exporting || filledAccounts === 0}
          onClick={() => void exportZip()}
          className="k-btn-primary flex-1"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          ZIP multi-comptes
        </button>
        <button
          type="button"
          disabled={filledAccounts === 0}
          onClick={() => void schedule()}
          className="k-btn-accent flex-1"
        >
          <Send className="h-4 w-4" />
          Publier
        </button>
      </div>

      {msg ? <p className="mt-3 text-center text-xs k-accent">{msg}</p> : null}

      <button
        type="button"
        onClick={() => setStep("analytics")}
        className="k-btn-ghost mx-auto mt-4 block"
      >
        Voir stats →
      </button>
    </section>
  );
}
