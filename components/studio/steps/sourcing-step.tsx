"use client";

import { Download, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { isGradientPlaceholder, placeholderUrl } from "@/lib/workspace/campaign-export";
import { downloadImageUrl, downloadText } from "@/lib/workspace/image-utils";
import { createCleanSlots } from "@/lib/workspace/storage";
import type { TikTokImportResult } from "@/lib/sourcing/types";
import { MOCK_SOURCING_FEED } from "@/lib/workspace/mock-sourcing";
import type { Campaign } from "@/lib/workspace/types";
import { AiPromptsBlock } from "../ai-prompts-block";
import { useWorkspace } from "../workspace-context";

function applyImport(
  result: TikTokImportResult,
  campaign: Campaign,
  updateCampaign: (c: Campaign) => Promise<void>,
) {
  const importedImages = result.slides
    .map((s) => s.imageUrl)
    .filter((u) => Boolean(u) && !isGradientPlaceholder(u));

  return updateCampaign({
    ...campaign,
    name: result.title.slice(0, 48),
    sourceLabel: result.title,
    importedImages,
    importedAsIs: true,
    slides: createCleanSlots(),
    caption: result.caption,
    hashtags: result.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)),
    status: "draft",
    cleanedAt: undefined,
  });
}

export function SourcingStep() {
  const { campaign, updateCampaign } = useWorkspace();
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const imported = campaign?.importedImages ?? [];

  async function importFromUrl() {
    if (!campaign) {
      setImportError("Crée d'abord une campagne dans Comptes.");
      return;
    }
    const url = tiktokUrl.trim();
    if (!url) return;

    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/sourcing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await res.json()) as TikTokImportResult | { error?: string };
      if (!res.ok) {
        throw new Error("error" in payload ? payload.error! : "Erreur");
      }
      await applyImport(payload as TikTokImportResult, campaign, updateCampaign);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setImporting(false);
    }
  }

  async function importMock(id: string) {
    if (!campaign) return;
    const item = MOCK_SOURCING_FEED.find((s) => s.id === id);
    if (!item) return;
    try {
      await applyImport(
        {
          title: item.title,
          author: "",
          caption: item.caption,
          hashtags: item.hashtags,
          sourceUrl: "",
          slides: item.slides.map((s, i) => ({
            imageUrl: placeholderUrl(i),
            text: s.text,
          })),
        },
        campaign,
        updateCampaign,
      );
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <>
    <section className="k-card">
      <h2 className="k-subheading">Importer ton TikTok</h2>
      <p className="mt-1 text-sm k-text-muted">
        Télécharge → modifie avec ton IA → upload dans Clean
      </p>

      <div className="mt-4 flex gap-2">
        <input
          value={tiktokUrl}
          onChange={(e) => setTiktokUrl(e.target.value)}
          placeholder="https://tiktok.com/…"
          className="k-input flex-1"
          disabled={importing}
          onKeyDown={(e) => e.key === "Enter" && void importFromUrl()}
        />
        <button
          type="button"
          disabled={importing || !tiktokUrl.trim()}
          onClick={() => void importFromUrl()}
          className="k-btn-primary shrink-0 px-5"
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          Importer
        </button>
      </div>

      {importError ? (
        <p className="mt-2 text-xs text-red-500">{importError}</p>
      ) : null}

      {imported.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="k-label">
              {imported.length} slide{imported.length > 1 ? "s" : ""}
              {campaign?.sourceLabel ? ` · ${campaign.sourceLabel}` : ""}
            </p>
            {campaign?.caption ? (
              <button
                type="button"
                onClick={() =>
                  downloadText(campaign.caption, "legende-tiktok.txt")
                }
                className="k-btn-ghost"
              >
                <Download className="h-3.5 w-3.5" />
                Légende
              </button>
            ) : null}
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {imported.map((url, i) => (
              <li key={`${url.slice(0, 32)}-${i}`}>
                <div
                  className="relative aspect-[9/16] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
                  style={{
                    backgroundImage: `url(${url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <span className="absolute left-2 top-2 k-badge">{i + 1}</span>
                </div>
                {!isGradientPlaceholder(url) ? (
                  <button
                    type="button"
                    onClick={() =>
                      void downloadImageUrl(url, `slide-${i + 1}.jpg`).catch(() =>
                        setImportError("Téléchargement impossible"),
                      )
                    }
                    className="k-btn-secondary mt-2 w-full py-2 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Télécharger
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setShowExamples((v) => !v)}
        className="k-btn-ghost mt-4"
      >
        {showExamples ? "Masquer exemples" : "Voir exemples"}
      </button>

      {showExamples ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {MOCK_SOURCING_FEED.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => importMock(item.id)}
                className="k-list-item w-full text-left"
              >
                <p className="truncate text-sm font-medium k-text">{item.title}</p>
                <p className="mt-0.5 text-xs k-text-muted">
                  {(item.views / 1000).toFixed(0)}k · {item.ratio}×
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
    <AiPromptsBlock />
    </>
  );
}
