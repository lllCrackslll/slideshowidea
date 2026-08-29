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
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { fileToDataUrl } from "@/lib/workspace/image-utils";
import {
  loadSchedule,
  removeScheduledPost,
  saveSchedule,
} from "@/lib/workspace/storage";
import type { Campaign, PublishFormat, ScheduledPost } from "@/lib/workspace/types";
import { canPublishWithSettings, type TikTokPostSettings } from "@/lib/tiktok/post-settings";
import { CampaignPicker } from "../campaign-picker";
import {
  EMPTY_TIKTOK_POST_SETTINGS,
  TikTokPublishOptions,
} from "../tiktok-publish-options";
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

function statusLabel(post: ScheduledPost) {
  if (post.status === "published") return "Publié sur TikTok";
  if (post.status === "failed") return "Échec";
  if (post.status === "simulated") return "Simulé (local)";
  return "En file";
}

function buildCaptionText(caption: string, promoCode?: string) {
  return [caption.trim(), promoCode ? `Code: ${promoCode}` : ""].filter(Boolean).join("\n");
}

async function publishVideoToAccount(params: {
  workspaceId: string;
  accountId: string;
  videoUrl: string;
  caption: string;
  settings: TikTokPostSettings;
}) {
  const blob = await urlToBlob(params.videoUrl);
  const form = new FormData();
  form.set("workspaceId", params.workspaceId);
  form.set("accountId", params.accountId);
  form.set("caption", params.caption);
  form.set("settings", JSON.stringify(params.settings));
  form.set("video", blob, blob.type.includes("webm") ? "video.webm" : "video.mp4");

  const res = await fetch("/api/tiktok/publish", {
    method: "POST",
    body: form,
  });
  const payload = (await res.json()) as {
    ok?: boolean;
    publishId?: string;
    mode?: "direct" | "inbox";
    error?: string;
  };
  return { ok: res.ok && Boolean(payload.ok), ...payload };
}

async function publishPhotosToAccount(params: {
  workspaceId: string;
  accountId: string;
  imageUrls: string[];
  caption: string;
  settings: TikTokPostSettings;
}) {
  const blobs = await Promise.all(params.imageUrls.map((url) => urlToBlob(url)));
  const form = new FormData();
  form.set("workspaceId", params.workspaceId);
  form.set("accountId", params.accountId);
  form.set("caption", params.caption);
  form.set("settings", JSON.stringify(params.settings));
  blobs.forEach((blob, i) => {
    form.append("images", blob, `slide-${i + 1}.jpg`);
  });

  const res = await fetch("/api/tiktok/publish-photos", {
    method: "POST",
    body: form,
  });
  const payload = (await res.json()) as {
    ok?: boolean;
    publishId?: string;
    mode?: "direct" | "inbox";
    error?: string;
  };
  return { ok: res.ok && Boolean(payload.ok), ...payload };
}

export function ScheduleStep() {
  const { workspace, campaign, accounts, updateCampaign, setStep } = useWorkspace();
  const [exporting, setExporting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const [musicConsent, setMusicConsent] = useState(false);
  const [tiktokSettings, setTikTokSettings] = useState<TikTokPostSettings>(EMPTY_TIKTOK_POST_SETTINGS);
  const [tiktokBlocked, setTikTokBlocked] = useState<string | null>(null);
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
    setTikTokSettings(EMPTY_TIKTOK_POST_SETTINGS);
    setMusicConsent(false);
  }, [campaignId]);

  const campaignPosts = useMemo(() => {
    if (!workspaceId || !campaignId) return [];
    void scheduleTick;
    return loadSchedule(workspaceId)
      .filter((post) => post.campaignId === campaignId)
      .slice()
      .reverse();
  }, [workspaceId, campaignId, scheduleTick]);

  const queuedPosts = useMemo(
    () => campaignPosts.filter((post) => post.status === "queued" || post.status === "simulated"),
    [campaignPosts],
  );

  const historyPosts = useMemo(
    () => campaignPosts.filter((post) => post.status === "published" || post.status === "failed"),
    [campaignPosts],
  );

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

  function refreshSchedule() {
    setScheduleTick((n) => n + 1);
  }

  function deleteQueuedPost(postId: string) {
    if (!workspaceId) return;
    removeScheduledPost(workspaceId, postId);
    if (lastBatch.some((post) => post.id === postId)) {
      setLastBatch((batch) => batch.filter((post) => post.id !== postId));
    }
    refreshSchedule();
  }

  function clearQueue() {
    if (!workspaceId || !campaignId) return;
    if (!queuedPosts.length) return;
    if (!window.confirm(`Supprimer ${queuedPosts.length} élément(s) en file ?`)) return;
    const remaining = loadSchedule(workspaceId).filter(
      (post) =>
        post.campaignId !== campaignId ||
        (post.status !== "queued" && post.status !== "simulated"),
    );
    saveSchedule(workspaceId, remaining);
    setLastBatch((batch) => batch.filter((post) => post.status === "published" || post.status === "failed"));
    refreshSchedule();
  }

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
    if (!canPublishWithSettings(tiktokSettings, musicConsent)) {
      setMsg("Complète les paramètres TikTok avant de publier.");
      return;
    }
    if (tiktokBlocked) {
      setMsg(tiktokBlocked);
      return;
    }

    const format = publishAsVideo ? "video" : "carousel";
    const hashtags = hashtagText
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));

    const fullCaption = [caption.trim(), hashtags.join(" ")].filter(Boolean).join("\n");
    const targets = accounts.filter((acc) => getAccountFiles(c, acc.id, format).length > 0);

    if (!targets.length) {
      setMsg(publishAsVideo ? "Ajoute une vidéo par compte" : "Ajoute des images par compte");
      return;
    }

    if (targets.some((acc) => acc.status !== "connected")) {
      setMsg("Connecte tous les comptes avec contenu dans Comptes avant de publier.");
      return;
    }

    setPublishing(true);
    setMsg(null);

    const now = new Date().toISOString();
    const results: ScheduledPost[] = [];
    let nextCampaign: Campaign = { ...c, caption: caption.trim(), hashtags, status: "published" };

    try {
      for (let i = 0; i < targets.length; i += 1) {
        const acc = targets[i];
        const postCaption = buildCaptionText(fullCaption, acc.promoCode);
        const postId = `post-${Date.now()}-${i}`;
        const files = getAccountFiles(c, acc.id, format);

        if (format === "video") {
          const apiResult = await publishVideoToAccount({
            workspaceId: ws.id,
            accountId: acc.id,
            videoUrl: files[0],
            caption: postCaption,
            settings: tiktokSettings,
          });

          results.push({
            id: postId,
            campaignId: c.id,
            accountId: acc.id,
            accountLabel: acc.label,
            scheduledAt: now,
            format,
            caption: postCaption,
            tiktokPublishId: apiResult.publishId,
            errorMessage: apiResult.error,
            status: apiResult.ok ? "published" : "failed",
          });

          if (apiResult.ok) {
            nextCampaign = setAccountFiles(nextCampaign, acc.id, [], "video");
          }
        } else {
          const apiResult = await publishPhotosToAccount({
            workspaceId: ws.id,
            accountId: acc.id,
            imageUrls: files,
            caption: postCaption,
            settings: tiktokSettings,
          });

          results.push({
            id: postId,
            campaignId: c.id,
            accountId: acc.id,
            accountLabel: acc.label,
            scheduledAt: now,
            format,
            caption: postCaption,
            tiktokPublishId: apiResult.publishId,
            errorMessage: apiResult.error,
            status: apiResult.ok ? "published" : "failed",
          });

          if (apiResult.ok) {
            nextCampaign = setAccountFiles(nextCampaign, acc.id, [], "carousel");
          }
        }
      }

      saveSchedule(ws.id, [...loadSchedule(ws.id), ...results]);
      await updateCampaign(nextCampaign);
      setLastBatch(results);
      refreshSchedule();

      const okCount = results.filter((post) => post.status === "published").length;
      const failCount = results.filter((post) => post.status === "failed").length;
      if (okCount && !failCount) {
        setMsg(`${okCount} publication${okCount > 1 ? "s" : ""} envoyée${okCount > 1 ? "s" : ""} sur TikTok.`);
      } else if (failCount) {
        setMsg(`${okCount} réussie(s), ${failCount} échec(s) — voir le détail ci-dessous.`);
      }
    } catch {
      setMsg("Erreur lors de la publication.");
    } finally {
      setPublishing(false);
    }
  }

  const filledAccounts = accounts.filter((a) =>
    getAccountFiles(c, a.id, publishAsVideo ? "video" : "carousel").length > 0,
  ).length;

  const publishFormat = publishAsVideo ? "video" : "carousel";
  const primaryAccount = accounts.find(
    (acc) => acc.status === "connected" && getAccountFiles(c, acc.id, publishFormat).length > 0,
  );
  const primaryVideoUrl =
    publishAsVideo && primaryAccount
      ? getAccountFiles(c, primaryAccount.id, "video")[0]
      : undefined;
  const canPublish =
    canPublishWithSettings(tiktokSettings, musicConsent) && !tiktokBlocked;

  const displayPosts = lastBatch.length > 0 ? lastBatch : historyPosts.slice(0, 6);

  function renderPostList(
    posts: ScheduledPost[],
    options?: { showDelete?: boolean; title: string; empty?: string },
  ) {
    if (!posts.length) {
      return options?.empty ? (
        <p className="text-xs k-text-muted">{options.empty}</p>
      ) : null;
    }

    return (
      <>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 k-accent" />
            <h3 className="text-sm font-medium k-text">{options?.title}</h3>
          </div>
          {options?.showDelete && posts.length ? (
            <button type="button" onClick={clearQueue} className="k-btn-ghost py-1 text-xs text-red-500">
              <Trash2 className="h-3.5 w-3.5" />
              Vider la file
            </button>
          ) : null}
        </div>
        <ul className="space-y-3">
          {posts.map((post) => {
            const acc = accounts.find((a) => a.id === post.accountId);
            return (
              <li
                key={post.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium k-text">
                    {post.accountLabel ?? acc?.label ?? post.accountId}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="k-badge">{statusLabel(post)}</span>
                    {options?.showDelete ? (
                      <button
                        type="button"
                        onClick={() => deleteQueuedPost(post.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-500/10"
                        title="Supprimer de la file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[10px] k-text-muted">
                  <Clock className="h-3 w-3" />
                  {formatWhen(post.scheduledAt)} · {post.format === "video" ? "Vidéo" : "Carrousel"}
                </p>
                {post.caption ? (
                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs k-text-secondary">
                    {post.caption}
                  </p>
                ) : null}
                {post.errorMessage ? (
                  <p className="mt-2 text-xs text-red-500">{post.errorMessage}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </>
    );
  }

  return (
    <section className="k-card">
      <h2 className="k-subheading">Publier</h2>
      <p className="mt-1 text-sm k-text-muted">
        Publication immédiate · carrousel ou vidéo
      </p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
      </div>

      <div className="k-callout mt-4 text-xs leading-relaxed k-text-secondary">
        Le bouton <strong>Publier</strong> envoie tout de suite sur TikTok les vidéos des comptes
        connectés. Sans connexion TikTok, la publication vidéo est bloquée.
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
                      {acc.status === "connected" ? "TikTok connecté" : "Non connecté — requis pour vidéo"}
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

      <TikTokPublishOptions
        workspaceId={ws.id}
        accountId={primaryAccount?.id ?? null}
        isVideo={publishAsVideo}
        videoUrl={primaryVideoUrl}
        settings={tiktokSettings}
        onSettingsChange={setTikTokSettings}
        musicConsent={musicConsent}
        onMusicConsentChange={setMusicConsent}
        onBlockedChange={setTikTokBlocked}
      />

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
          disabled={filledAccounts === 0 || publishing || !caption.trim() || !canPublish}
          onClick={() => void publish()}
          className="k-btn-accent flex-1"
        >
          {publishing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {publishing ? "Publication…" : "Publier maintenant"}
        </button>
      </div>

      {msg ? (
        <p
          className={`mt-3 text-center text-xs ${msg.includes("échec") || msg.includes("Erreur") || msg.includes("Connecte") || msg.includes("Ajoute") || msg.includes("Coche") ? "text-red-500" : "k-accent"}`}
        >
          {msg}
        </p>
      ) : null}

      {queuedPosts.length ? (
        <section className="k-card-flat mt-6">
          {renderPostList(queuedPosts, {
            showDelete: true,
            title: `File d'attente (${queuedPosts.length})`,
          })}
        </section>
      ) : null}

      {displayPosts.length ? (
        <section className="k-card-flat mt-6">
          {renderPostList(displayPosts, {
            title: lastBatch.length
              ? `${lastBatch.length} publication${lastBatch.length > 1 ? "s" : ""} à l'instant`
              : "Historique récent",
          })}
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
