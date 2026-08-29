"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  consentText,
  EMPTY_TIKTOK_POST_SETTINGS,
  privacyLabel,
  type TikTokCreatorInfo,
  type TikTokPostSettings,
} from "@/lib/tiktok/post-settings";

type Props = {
  workspaceId: string;
  accountId: string | null;
  isVideo: boolean;
  videoUrl?: string;
  settings: TikTokPostSettings;
  onSettingsChange: (settings: TikTokPostSettings) => void;
  musicConsent: boolean;
  onMusicConsentChange: (value: boolean) => void;
  onBlockedChange?: (blocked: string | null) => void;
};

function getVideoDurationSec(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error("Durée vidéo illisible."));
    video.src = url;
  });
}

export function TikTokPublishOptions({
  workspaceId,
  accountId,
  isVideo,
  videoUrl,
  settings,
  onSettingsChange,
  musicConsent,
  onMusicConsentChange,
  onBlockedChange,
}: Props) {
  const [creator, setCreator] = useState<TikTokCreatorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);

  useEffect(() => {
    if (!accountId) {
      setCreator(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/tiktok/creator-info?workspaceId=${encodeURIComponent(workspaceId)}&accountId=${encodeURIComponent(accountId)}`,
    )
      .then(async (res) => {
        const payload = (await res.json()) as { creator?: TikTokCreatorInfo; error?: string };
        if (!res.ok) throw new Error(payload.error ?? "creator_info impossible.");
        if (!cancelled) setCreator(payload.creator ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setCreator(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, accountId]);

  useEffect(() => {
    if (!isVideo || !videoUrl) {
      setVideoDurationSec(null);
      return;
    }
    getVideoDurationSec(videoUrl)
      .then(setVideoDurationSec)
      .catch(() => setVideoDurationSec(null));
  }, [isVideo, videoUrl]);

  const blocked = useMemo(() => {
    if (!accountId) return "Connecte un compte TikTok.";
    if (loading) return null;
    if (error) return error;
    if (!creator) return "Infos créateur indisponibles.";
    if (!creator.privacyLevelOptions.length) return "Publication indisponible pour ce compte.";
    if (isVideo && videoDurationSec && videoDurationSec > creator.maxVideoPostDurationSec) {
      return `Vidéo trop longue (max ${creator.maxVideoPostDurationSec}s).`;
    }
    if (settings.privacyLevel && settings.privacyLevel !== "SELF_ONLY") {
      return "En sandbox, choisis « Moi seulement » pour la confidentialité.";
    }
    if (!settings.title.trim()) return "Ajoute un titre TikTok.";
    if (settings.commercialEnabled && settings.brandedContent && settings.privacyLevel === "SELF_ONLY") {
      return "Contenu de marque : la visibilité ne peut pas être privée.";
    }
    if (settings.commercialEnabled && !settings.yourBrand && !settings.brandedContent) {
      return "Indique si le contenu te promeut, une marque, ou les deux.";
    }
    return null;
  }, [accountId, loading, error, creator, isVideo, videoDurationSec, settings]);

  useEffect(() => {
    onBlockedChange?.(blocked);
  }, [blocked, onBlockedChange]);

  function patch(partial: Partial<TikTokPostSettings>) {
    onSettingsChange({ ...settings, ...partial });
  }

  if (!accountId) return null;

  return (
    <section className="k-row mt-4 space-y-3">
      <p className="k-label">Paramètres TikTok</p>

      <div className="k-callout text-xs leading-relaxed k-text-secondary">
        <strong>Sandbox :</strong> compte TikTok en <strong>privé</strong> dans l&apos;app mobile +
        confidentialité <strong>Moi seulement</strong>. Sinon TikTok renvoie l&apos;erreur guidelines.
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-xs k-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Chargement du compte…
        </p>
      ) : null}

      {creator ? (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-3">
          {creator.creatorAvatarUrl ? (
            <img
              src={creator.creatorAvatarUrl}
              alt=""
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : null}
          <div>
            <p className="text-sm font-medium k-text">{creator.creatorNickname ?? creator.creatorUsername}</p>
            <p className="text-[10px] k-text-muted">@{creator.creatorUsername}</p>
          </div>
        </div>
      ) : null}

      <label className="block">
        <span className="k-label mb-1 block">Titre *</span>
        <input
          value={settings.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Titre du post"
          className="k-input h-10 w-full px-3 text-sm"
        />
      </label>

      <label className="block">
        <span className="k-label mb-1 block">Confidentialité *</span>
        <select
          value={settings.privacyLevel}
          onChange={(e) => patch({ privacyLevel: e.target.value })}
          className="k-input h-10 w-full px-3 text-sm"
        >
          <option value="">Choisir…</option>
          {(creator?.privacyLevelOptions ?? []).map((option) => {
            const disabled =
              settings.commercialEnabled &&
              settings.brandedContent &&
              option === "SELF_ONLY";
            return (
              <option key={option} value={option} disabled={disabled}>
                {privacyLabel(option)}
                {disabled ? " (indisponible pour contenu de marque)" : ""}
              </option>
            );
          })}
        </select>
      </label>

      <div className="space-y-2">
        <p className="k-label">Interactions</p>
        <label className="flex items-center gap-2 text-xs k-text-muted">
          <input
            type="checkbox"
            checked={settings.allowComment}
            disabled={creator?.commentDisabled}
            onChange={(e) => patch({ allowComment: e.target.checked })}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Autoriser les commentaires
        </label>
        {isVideo ? (
          <>
            <label className="flex items-center gap-2 text-xs k-text-muted">
              <input
                type="checkbox"
                checked={settings.allowDuet}
                disabled={creator?.duetDisabled}
                onChange={(e) => patch({ allowDuet: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Autoriser Duet
            </label>
            <label className="flex items-center gap-2 text-xs k-text-muted">
              <input
                type="checkbox"
                checked={settings.allowStitch}
                disabled={creator?.stitchDisabled}
                onChange={(e) => patch({ allowStitch: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Autoriser Stitch
            </label>
          </>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs k-text">
          <input
            type="checkbox"
            checked={settings.commercialEnabled}
            onChange={(e) =>
              patch({
                commercialEnabled: e.target.checked,
                yourBrand: false,
                brandedContent: false,
              })
            }
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Contenu commercial / promotionnel
        </label>
        {settings.commercialEnabled ? (
          <div className="ml-6 space-y-2">
            <label className="flex items-center gap-2 text-xs k-text-muted">
              <input
                type="checkbox"
                checked={settings.yourBrand}
                onChange={(e) => patch({ yourBrand: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Ta marque — libellé « Promotional content »
            </label>
            <label className="flex items-center gap-2 text-xs k-text-muted">
              <input
                type="checkbox"
                checked={settings.brandedContent}
                onChange={(e) => patch({ brandedContent: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Contenu de marque — libellé « Paid partnership »
            </label>
          </div>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-xs k-text-muted">
        <input
          type="checkbox"
          checked={musicConsent}
          onChange={(e) => onMusicConsentChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
        />
        <span>{consentText(settings)}</span>
      </label>

      <p className="text-[10px] k-text-muted">
        Le traitement peut prendre quelques minutes avant d&apos;apparaître sur TikTok.
      </p>

      {blocked ? <p className="text-xs text-red-500">{blocked}</p> : null}
    </section>
  );
}

export { EMPTY_TIKTOK_POST_SETTINGS };
