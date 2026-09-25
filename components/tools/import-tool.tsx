"use client";

import { Copy, Download, Link2, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import type { TikTokImportResult } from "@/lib/sourcing/types";
import { getToolGuide } from "@/lib/tool-guides";
import { downloadSlidesZip } from "@/lib/workspace/export-slides";
import { downloadImageUrl, downloadText } from "@/lib/workspace/image-utils";

const PROMPT_TRANSLATE =
  "Traduis uniquement le texte visible de cette image en français, sans modifier les dimensions, la mise en page, les couleurs, les polices, les visuels ni aucun autre élément.";

function PromptRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="k-row">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="k-label">{label}</p>
        <button type="button" onClick={() => void copy()} className="k-btn-ghost py-1">
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <p className="text-sm leading-relaxed k-text-secondary">{text}</p>
    </div>
  );
}

export function ImportTool() {
  const guide = getToolGuide("/import");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [result, setResult] = useState<TikTokImportResult | null>(null);
  const [appName, setAppName] = useState("Mon app");

  const images = result?.slides.map((s) => s.imageUrl).filter(Boolean) ?? [];

  async function importFromUrl() {
    const url = tiktokUrl.trim();
    if (!url) return;

    setImporting(true);
    setImportError(null);
    setResult(null);

    try {
      const res = await fetch("/api/sourcing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await res.json()) as TikTokImportResult | { error?: string };
      if (!res.ok) {
        throw new Error("error" in payload ? payload.error! : "Import impossible");
      }
      setResult(payload as TikTokImportResult);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Import impossible");
    } finally {
      setImporting(false);
    }
  }

  async function downloadZip() {
    if (!result || !images.length) return;
    setDownloadingZip(true);
    setImportError(null);
    try {
      const caption = [result.caption, result.hashtags.join(" ")].filter(Boolean).join("\n\n");
      await downloadSlidesZip({
        campaignName: result.title.slice(0, 24) || "carrousel",
        caption,
        getImages: () => images,
      });
    } catch {
      setImportError("Export ZIP impossible");
    } finally {
      setDownloadingZip(false);
    }
  }

  const promptWithApp =
    `${PROMPT_TRANSLATE.slice(0, -1)}, et remplace le nom de l'app par ${appName.trim() || "Mon app"}.`;

  return (
    <ToolPage
      title="Import TikTok"
      subtitle="Colle un lien de carrousel photo TikTok et télécharge toutes les slides."
    >
      <section className="k-card">
        <h2 className="k-subheading">Lien TikTok</h2>
        <p className="mt-1 text-sm k-text-muted">
          Fonctionne avec les carrousels photo publics (slideshow). Les vidéos seules ne sont pas
          supportées.
        </p>

        <div className="mt-4 flex gap-2">
          <input
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://tiktok.com/@…/video/…"
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

        {importError ? <p className="mt-2 text-xs text-red-500">{importError}</p> : null}
        {result?.partial && result.hint ? (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{result.hint}</p>
        ) : null}
      </section>

      {result && images.length > 0 ? (
        <section className="k-card mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="k-subheading">{result.title}</h2>
              {result.author ? (
                <p className="mt-0.5 text-xs k-text-muted">@{result.author}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              {result.caption ? (
                <button
                  type="button"
                  onClick={() =>
                    downloadText(
                      [result.caption, result.hashtags.join(" ")].filter(Boolean).join("\n\n"),
                      "legende-tiktok.txt",
                    )
                  }
                  className="k-btn-ghost"
                >
                  <Download className="h-3.5 w-3.5" />
                  Légende
                </button>
              ) : null}
              <button
                type="button"
                disabled={downloadingZip}
                onClick={() => void downloadZip()}
                className="k-btn-primary"
              >
                {downloadingZip ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Package className="h-3.5 w-3.5" />
                )}
                ZIP ({images.length})
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((url, i) => (
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
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {result ? (
        <section className="k-card-flat mt-4">
          <p className="k-label mb-3">Prompts IA (après téléchargement)</p>
          <label className="mb-3 block">
            <span className="k-label mb-1 block">Nom de ton app</span>
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="k-input h-10 max-w-xs"
              placeholder="Mon app"
            />
          </label>
          <div className="space-y-3">
            <PromptRow label="Traduction seule" text={PROMPT_TRANSLATE} />
            <PromptRow label="Traduction + nom d'app" text={promptWithApp} />
          </div>
        </section>
      ) : null}

      {guide ? <ToolTutorial guide={guide} className="mt-6" /> : null}
    </ToolPage>
  );
}
