"use client";

import { Check, Copy, Download, Loader2, Package } from "lucide-react";
import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import type { Carousel } from "@/lib/types";
import {
  downloadDailyPack,
  downloadDistributionPack,
  slidesToExportFormat,
  splitAccountsAcrossConcepts,
} from "@/utils/generateSlides";

type DistributionPanelProps = {
  carousel: Carousel;
  carouselQueue?: Carousel[];
  disabled?: boolean;
};

export function DistributionPanel({
  carousel,
  carouselQueue = [],
  disabled = false,
}: DistributionPanelProps) {
  const [accountCount, setAccountCount] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [copied, setCopied] = useState<"caption" | "hashtags" | null>(null);

  const hasQueue = carouselQueue.length > 1;

  async function copyCaption() {
    await copyText(carousel.caption);
    setCopied("caption");
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function copyHashtags() {
    await copyText(carousel.hashtags.join(" "));
    setCopied("hashtags");
    window.setTimeout(() => setCopied(null), 1600);
  }

  async function exportSinglePack() {
    setExporting(true);
    setProgress("Préparation du pack…");
    try {
      await downloadDistributionPack({
        slides: slidesToExportFormat(carousel.slides),
        topicTitle: carousel.topic,
        caption: carousel.caption,
        hashtags: carousel.hashtags,
        accountCount,
        onProgress: (done, total) =>
          setProgress(`Rendu visuel ${done}/${total}…`),
      });
      setProgress(`${accountCount} comptes exportés.`);
    } catch (error) {
      setProgress(
        error instanceof Error ? error.message : "Export impossible.",
      );
    } finally {
      setExporting(false);
    }
  }

  async function exportDailyPack() {
    if (carouselQueue.length === 0) return;
    setExporting(true);
    setProgress("Pack journalier en cours…");
    try {
      const splits = splitAccountsAcrossConcepts(
        carouselQueue.length,
        accountCount,
      );
      await downloadDailyPack(
        carouselQueue.map((item, index) => ({
          topicTitle: item.topic,
          caption: item.caption,
          hashtags: item.hashtags,
          slides: slidesToExportFormat(item.slides),
          accountCount: splits[index],
        })),
        (done, total) => setProgress(`Rendu visuel ${done}/${total}…`),
      );
      setProgress(
        `Pack journalier : ${carouselQueue.length} concepts, ${accountCount} comptes.`,
      );
    } catch (error) {
      setProgress(
        error instanceof Error ? error.message : "Export impossible.",
      );
    } finally {
      setExporting(false);
    }
  }

  const splitPreview = hasQueue
    ? splitAccountsAcrossConcepts(carouselQueue.length, accountCount)
    : null;

  return (
    <section className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">
            Distribution TikTok
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            1 dossier = 1 compte. Visuels uniques par compte, même texte.
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          Workflow carrousel
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <label className="block text-xs text-zinc-400">
          Nombre de comptes
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={3}
              max={20}
              value={accountCount}
              onChange={(e) => setAccountCount(Number(e.target.value))}
              className="w-full max-w-xs accent-emerald-400"
            />
            <span className="w-8 text-sm font-medium text-zinc-200">
              {accountCount}
            </span>
          </div>
          {splitPreview ? (
            <p className="mt-1 text-[11px] text-zinc-600">
              Répartition :{" "}
              {splitPreview
                .map((n, i) => `Concept ${i + 1} → ${n} comptes`)
                .join(" · ")}
            </p>
          ) : null}
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCaption}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#27272a] px-3 text-xs text-zinc-300 hover:bg-white/[0.03]"
          >
            {copied === "caption" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Légende
          </button>
          <button
            type="button"
            onClick={copyHashtags}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#27272a] px-3 text-xs text-zinc-300 hover:bg-white/[0.03]"
          >
            {copied === "hashtags" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Hashtags
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || exporting || carousel.slides.length !== 5}
          onClick={exportSinglePack}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-zinc-950 disabled:opacity-50"
        >
          {exporting && !hasQueue ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          Pack {accountCount} comptes
        </button>

        {hasQueue ? (
          <button
            type="button"
            disabled={disabled || exporting}
            onClick={exportDailyPack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 text-sm font-medium text-emerald-300 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Pack journalier ({carouselQueue.length} concepts)
          </button>
        ) : null}
      </div>

      {progress ? (
        <p className="mt-3 text-xs text-zinc-400">{progress}</p>
      ) : null}

      <ol className="mt-4 space-y-1 border-t border-[#27272a] pt-3">
        {[
          "Génère 1 à 3 concepts (texte différent par concept).",
          "Exporte le pack — chaque compte reçoit 5 JPG uniques + caption.txt.",
          "Sur TikTok : Créer → Photo → importe slide-1 à slide-5 → colle la légende.",
        ].map((step, i) => (
          <li key={step} className="flex gap-2 text-[11px] text-zinc-500">
            <span className="text-zinc-600">{i + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
