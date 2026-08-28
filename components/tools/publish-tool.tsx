"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  ExternalLink,
  ImageIcon,
  Loader2,
  Send,
  Video,
} from "lucide-react";
import { FileDropzone } from "@/components/shell/file-dropzone";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import {
  SlideImagesPanel,
  emptySlideImages,
  slideImagesReady,
  type SlideImages,
} from "@/components/slide-images-panel";
import { loadPlanningSettings } from "@/lib/distribution/planning-settings";
import { getToolGuide } from "@/lib/tool-guides";
import { buildPublishPreview } from "@/lib/tiktok-publish/preview-queue";
import {
  loadPublishAccounts,
  loadProxySettings,
  saveProxySettings,
  toggleMockConnection,
} from "@/lib/tiktok-publish/storage";
import type {
  PublishFormat,
  PublishProxySettings,
  PublishQueueItem,
  TikTokAccountLink,
} from "@/lib/tiktok-publish/types";

export function PublishTool() {
  const [format, setFormat] = useState<PublishFormat>("carousel");
  const [slideImages, setSlideImages] = useState<SlideImages>(emptySlideImages);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [accounts, setAccounts] = useState<TikTokAccountLink[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [proxy, setProxy] = useState<PublishProxySettings>(loadProxySettings);
  const [queue, setQueue] = useState<PublishQueueItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const planning = loadPlanningSettings();
  const connectedCount = accounts.filter((a) => a.status === "connected").length;

  useEffect(() => {
    const loaded = loadPublishAccounts();
    setAccounts(loaded);
    setSelected(
      loaded.filter((a) => a.status === "connected").map((a) => a.accountIndex),
    );
    setProxy(loadProxySettings());
  }, []);

  const mediaReady =
    format === "carousel" ? slideImagesReady(slideImages) : Boolean(videoFile);

  const selectedConnected = useMemo(
    () =>
      selected.filter((index) =>
        accounts.some((a) => a.accountIndex === index && a.status === "connected"),
      ),
    [selected, accounts],
  );

  function toggleAccount(index: number) {
    setSelected((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index],
    );
  }

  function handleMockConnect(index: number) {
    setAccounts(toggleMockConnection(index));
  }

  function updateProxy(partial: Partial<PublishProxySettings>) {
    setProxy(saveProxySettings(partial));
  }

  async function handlePublish() {
    if (!mediaReady) {
      setMessage(
        format === "carousel"
          ? "Importe les 5 images du carrousel."
          : "Importe une vidéo.",
      );
      return;
    }
    if (!caption.trim()) {
      setMessage("Ajoute une légende.");
      return;
    }
    if (!selectedConnected.length) {
      setMessage("Connecte et sélectionne au moins un compte TikTok.");
      return;
    }

    setBusy(true);
    setMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const preview = buildPublishPreview(format, selectedConnected).map(
      (item) => ({ ...item, status: "simulated" as const }),
    );
    setQueue(preview);
    setMessage(
      `File prête pour ${preview.length} compte(s) — branchement API TikTok côté backend requis pour publier réellement.`,
    );
    setBusy(false);
  }

  return (
    <ToolPage
      title="Publish"
      subtitle="Publie un carrousel ou une vidéo sur plusieurs comptes TikTok (UI prête — API à brancher)."
    >
      <div className="mb-5 k-callout">
        <div className="flex gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 k-accent" />
          <p className="text-xs leading-relaxed k-text-secondary">
            Front-end seulement pour l&apos;instant. La publication réelle passera
            par l&apos;{" "}
            <strong className="font-medium">API TikTok Content Posting</strong>{" "}
            (OAuth par compte + backend). Les proxies Webshare se configurent ici
            mais ne remplacent pas l&apos;API officielle.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <section className="k-card">
          <p className="k-label mb-1">Étape 1</p>
          <h2 className="k-subheading">Type de contenu</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormat("carousel")}
              className={`k-chip ${format === "carousel" ? "k-chip-active" : ""}`}
            >
              <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
              Carrousel (5 images)
            </button>
            <button
              type="button"
              onClick={() => setFormat("video")}
              className={`k-chip ${format === "video" ? "k-chip-active" : ""}`}
            >
              <Video className="mr-1.5 h-3.5 w-3.5" />
              Vidéo
            </button>
          </div>
        </section>

        <section className="k-card">
          <p className="k-label mb-1">Étape 2</p>
          <h2 className="k-subheading">Importer le média</h2>
          {format === "carousel" ? (
            <div className="mt-3">
              <SlideImagesPanel
                images={slideImages}
                onChange={setSlideImages}
              />
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <FileDropzone
                accept="video/mp4,video/quicktime,video/webm"
                label="Vidéo TikTok"
                hint="MP4, MOV, WebM — idéalement 9:16"
                onFiles={(files) => setVideoFile(files[0] ?? null)}
              />
              {videoFile ? (
                <p className="text-xs k-text-muted">{videoFile.name}</p>
              ) : null}
            </div>
          )}
        </section>

        <section className="k-card">
          <p className="k-label mb-1">Étape 3</p>
          <h2 className="k-subheading">Légende</h2>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={5}
            placeholder="Ta légende TikTok…"
            className="k-input mt-3 w-full resize-y px-3 py-2.5 text-sm"
          />
        </section>

        <section className="k-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="k-label mb-1">Étape 4</p>
              <h2 className="k-subheading">Comptes TikTok</h2>
              <p className="mt-1 text-xs k-text-muted">
                {connectedCount}/{planning.accountCount} connectés — liste
                synchronisée avec{" "}
                <Link href="/planning" className="k-link">
                  Planning
                </Link>
                .
              </p>
            </div>
            <span className="k-badge">{selectedConnected.length} sélectionné(s)</span>
          </div>

          <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            {accounts.map((account) => {
              const isConnected = account.status === "connected";
              const isSelected = selected.includes(account.accountIndex);
              return (
                <li
                  key={account.accountIndex}
                  className="k-row flex flex-wrap items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isConnected}
                    onChange={() => toggleAccount(account.accountIndex)}
                    className="accent-[#007aff]"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm k-text">
                    {account.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      isConnected ? "k-accent" : "k-text-faint"
                    }`}
                  >
                    {isConnected ? "Connecté" : "Non connecté"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMockConnect(account.accountIndex)}
                    className="k-btn-secondary h-8 px-2.5 text-[11px]"
                  >
                    {isConnected ? "Déconnecter" : "Connecter (mock)"}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[10px] k-text-faint">
            En production : bouton OAuth TikTok par compte (redirect vers
            tiktok.com/v2/auth/authorize).
          </p>
        </section>

        <section className="k-card">
          <p className="k-label mb-1">Étape 5 — optionnel</p>
          <h2 className="k-subheading">Proxies Webshare</h2>
          <p className="mt-1 text-xs leading-relaxed k-text-muted">
            Dedicated Static Residential : 1 IP fixe par compte. Utile seulement
            si le backend automatise des sessions navigateur —{" "}
            <strong className="font-medium k-text">
              pas un bouclier anti-ban
            </strong>{" "}
            avec l&apos;API officielle.
          </p>

          <label className="mt-4 flex items-center gap-2 text-sm k-text">
            <input
              type="checkbox"
              checked={proxy.enabled}
              onChange={(e) => updateProxy({ enabled: e.target.checked })}
              className="accent-[#007aff]"
            />
            Activer Webshare (backend)
          </label>

          {proxy.enabled ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs k-text-muted sm:col-span-2">
                Clé API Webshare
                <input
                  type="password"
                  value={proxy.apiKey}
                  onChange={(e) => updateProxy({ apiKey: e.target.value })}
                  placeholder="ws_…"
                  className="k-input mt-1 h-9 w-full text-sm"
                />
              </label>
              <label className="block text-xs k-text-muted">
                Type
                <select
                  value={proxy.proxyMode}
                  onChange={(e) =>
                    updateProxy({
                      proxyMode: e.target.value as PublishProxySettings["proxyMode"],
                    })
                  }
                  className="k-input mt-1 h-9 w-full text-sm"
                >
                  <option value="residential_static">
                    Residential Static (1 IP / compte)
                  </option>
                  <option value="residential_rotating">Residential Rotating</option>
                </select>
              </label>
              <label className="flex items-end gap-2 pb-1 text-xs k-text-muted">
                <input
                  type="checkbox"
                  checked={proxy.oneProxyPerAccount}
                  onChange={(e) =>
                    updateProxy({ oneProxyPerAccount: e.target.checked })
                  }
                  className="accent-[#007aff]"
                />
                1 proxy dédié par compte TikTok
              </label>
            </div>
          ) : null}
        </section>

        <section className="k-card-glow">
          <p className="k-label mb-1">Étape 6</p>
          <h2 className="k-subheading">Publier</h2>
          <p className="mt-1 text-xs k-text-muted">
            Horaires espacés selon ton Planning ({planning.intervalMinutes} min
            entre posts).
          </p>

          <button
            type="button"
            disabled={busy}
            onClick={() => void handlePublish()}
            className="k-btn-primary mt-4 h-11 w-full disabled:opacity-50 sm:w-auto"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Préparer la publication multi-comptes
          </button>

          {message ? (
            <p className="mt-3 text-xs k-accent">{message}</p>
          ) : null}

          {queue.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {queue.map((item) => (
                <li
                  key={item.accountIndex}
                  className="k-row flex items-center justify-between text-xs"
                >
                  <span className="truncate k-text-secondary">
                    {item.accountLabel} —{" "}
                    {item.format === "carousel" ? "Carrousel" : "Vidéo"}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 tabular-nums k-accent">
                    <Check className="h-3 w-3" />
                    {item.scheduledAt}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          <a
            href="https://developers.tiktok.com/doc/content-posting-api-get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs k-link"
          >
            Doc API TikTok Content Posting
            <ExternalLink className="h-3 w-3" />
          </a>
        </section>
      </div>

      {getToolGuide("/publish") ? (
        <ToolTutorial
          guide={getToolGuide("/publish")!}
          showStatus={false}
          className="mt-6"
        />
      ) : null}
    </ToolPage>
  );
}
