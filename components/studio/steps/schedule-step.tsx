"use client";

import {
  CheckCircle2,
  Clapperboard,
  Clock,
  Images,
  Loader2,
  Package,
  Plus,
  Send,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: ScheduledPost["status"]) {
  if (status === "published") return "Publié sur TikTok";
  if (status === "simulated") return "Simulé (local)";
  return "En file";
}

function buildCaptionText(caption: string, promoCode?: string) {
  return [caption.trim(), promoCode ? `Code: ${promoCode}` : ""].filter(Boolean).join("\n");
}

export function ScheduleStep() {
  const { workspace, campaign, accounts, updateCampaign, setStep } = useWorkspace();
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const [musicConsent, setMusicConsent] = useState(false);
  const [lastBatch, setLastBatch] = useState<ScheduledPost[]>([]);
  const [scheduleTick, setScheduleTick] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const campaignId = campaign?.id;
  const workspaceId = workspace?.id;

  useEffect(() => {
    if (!campaign) return;
    setCaption(campaign.caption ?? "");
    setHashtagText(campaign.hashtags?.join(" ") ?? "");
    setLastBatch([]);
  }, [campaignId]);

  const recentPosts = useMemo(() => {
    if (!workspaceId || !campaignId) return [];
    void scheduleTick;
    return loadSchedule(workspaceId)
      .filter((post) => post.campaignId === campaignId)
      .slice(-12)
      .reverse();
  }, [workspaceId, campaignId, scheduleTick]);

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
    const fullCaption = [caption.trim(), hashtagText.trim()].filter(Boolean).join("\n");
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

        root.file("caption.txt", buildCaptionText(fullCaption, acc.promoCode));
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

  async function publish() {
    if (!caption.trim()) {
      setMsg("Ajoute une description avant de publier.");
      return;
    }
    if (!musicConsent) {
      setMsg("Coche la confirmation musique TikTok avant de publier.");
      return;
    }

    const format = publishAsVideo ? "video" : "carousel";
    const hashtags = hashtagText
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    const fullCaption = [caption.trim(), hashtags.join(" ")].filter(Boolean).join("\n");
    const posts: ScheduledPost[] = [];

    accounts.forEach((acc, i) => {
      if (!getAccountFiles(c, acc.id, format).length) return;
      const d = new Date();
      d.setHours(acc.publishHour, acc.publishMinute + i * 30, 0, 0);
      const isConnected = acc.status === "connected";
      posts.push({
        id: `post-${Date.now()}-${i}`,
        campaignId: c.id,
        accountId: acc.id,
        accountLabel: acc.label,
        scheduledAt: d.toISOString(),
        format,
        caption: buildCaptionText(fullCaption, acc.promoCode),
        status: isConnected ? "simulated" : "simulated",
      });
    });

    if (!posts.length) {
      setMsg(publishAsVideo ? "Ajoute une vidéo par compte" : "Ajoute des images par compte");
      return;
    }

    setPublishing(true);
    setMsg(null);

    try {
      saveSchedule(ws.id, [...loadSchedule(ws.id), ...posts]);
      await updateCampaign({
        ...c,
        caption: caption.trim(),
        hashtags,
        status: "published",
      });
      posts.forEach((p) => bumpMetrics(ws.id, p.accountId));
      setLastBatch(posts);
      setScheduleTick((n) => n + 1);
    } finally {
      setPublishing(false);
    }
  }

  const filledAccounts = accounts.filter((a) =>
    getAccountFiles(c, a.id, publishAsVideo ? "video" : "carousel").length > 0,
  ).length;

  const displayPosts = lastBatch.length > 0 ? lastBatch : recentPosts.slice(0, 6);

  return (
    <section className="k-card">
      <h2 className="k-subheading">Publier</h2>
      <p className="mt-1 text-sm k-text-muted">
        Carrousel ou vidéo · un pack par compte
      </p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
      </div>

      <div className="k-callout mt-4 text-xs leading-relaxed k-text-secondary">
        La publication TikTok réelle arrive après approbation API. Pour l&apos;instant, tu
        prépares le contenu ici — le bouton Publier enregistre la file et affiche le récap
        par compte.
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
            placeholder="#app #fyp #marketing"
            className="k-input h-10 w-full px-3 text-sm"
          />
        </label>
        <label className="flex cursor-pointer items-start gap-2 text-xs k-text-muted">
          <input
            type="checkbox"
            checked={musicConsent}
            onChange={(e) => setMusicConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
          />
          <span>
            By posting, you agree to TikTok&apos;s Music Usage Confirmation.
          </span>
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
                  <div>
                    <p className="text-sm font-medium k-text">{acc.label}</p>
                    <p className="text-[10px] k-text-muted">
                      {acc.status === "connected" ? "TikTok connecté" : "Non connecté"} ·{" "}
                      {acc.publishHour}h{String(acc.publishMinute).padStart(2, "0")}
                    </p>
                  </div>
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
          disabled={filledAccounts === 0 || publishing || !caption.trim() || !musicConsent}
          onClick={() => void publish()}
          className="k-btn-accent flex-1"
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Publier
        </button>
      </div>

      {msg ? <p className="mt-3 text-center text-xs text-red-500">{msg}</p> : null}

      {displayPosts.length ? (
        <section className="k-card-flat mt-6">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 k-accent" />
            <h3 className="text-sm font-medium k-text">
              {lastBatch.length
                ? `${lastBatch.length} publication${lastBatch.length > 1 ? "s" : ""} enregistrée${lastBatch.length > 1 ? "s" : ""}`
                : "Publications récentes"}
            </h3>
          </div>
          <ul className="space-y-3">
            {displayPosts.map((post) => {
              const acc = accounts.find((a) => a.id === post.accountId);
              return (
                <li key={post.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium k-text">
                      {post.accountLabel ?? acc?.label ?? post.accountId}
                    </p>
                    <span className="k-badge">{statusLabel(post.status)}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1 text-[10px] k-text-muted">
                    <Clock className="h-3 w-3" />
                    {formatWhen(post.scheduledAt)} ·{" "}
                    {post.format === "video" ? "Vidéo" : "Carrousel"}
                  </p>
                  {post.caption ? (
                    <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs k-text-secondary">
                      {post.caption}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

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
