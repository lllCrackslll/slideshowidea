"use client";

import { Check, Copy, ExternalLink, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAccountNames } from "@/components/distribution/account-names-panel";
import type { SlideImages } from "@/components/slide-images-panel";
import { slideImagesReady } from "@/components/slide-images-panel";
import { copyText } from "@/lib/clipboard";
import {
  DEFAULT_PLANNING_SETTINGS,
  loadPlanningSettings,
  type PlanningSettings,
} from "@/lib/distribution/planning-settings";
import { savePackHistoryEntry } from "@/lib/distribution/pack-history";
import type { Carousel } from "@/lib/types";
import {
  downloadDistributionPack,
  slidesToExportFormat,
} from "@/utils/generateSlides";

type DistributionPanelProps = {
  carousel: Carousel;
  slideImages: SlideImages;
  disabled?: boolean;
};

export function DistributionPanel({
  carousel,
  slideImages,
  disabled = false,
}: DistributionPanelProps) {
  const [planning, setPlanning] = useState<PlanningSettings>(
    DEFAULT_PLANNING_SETTINGS,
  );
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const accountCount = planning.accountCount;
  const hasCustomImages = slideImagesReady(slideImages);

  useEffect(() => {
    setPlanning(loadPlanningSettings());
  }, []);

  const accountNames = useMemo(
    () => getAccountNames(accountCount),
    [accountCount],
  );

  async function copyCaption() {
    await copyText(carousel.caption);
    setCopiedCaption(true);
    window.setTimeout(() => setCopiedCaption(false), 1600);
  }

  async function handleExport() {
    if (carousel.slides.length !== 5) {
      setProgress("Le carrousel doit avoir 5 slides.");
      return;
    }

    setExporting(true);
    setProgress("Préparation du pack…");

    try {
      await downloadDistributionPack({
        slides: slidesToExportFormat(carousel.slides),
        topicTitle: carousel.topic,
        caption: carousel.caption,
        hashtags: carousel.hashtags,
        accountCount,
        accountNames,
        slideBackgrounds: hasCustomImages ? slideImages : undefined,
        onProgress: (done, total) =>
          setProgress(`Création des visuels ${done}/${total}…`),
      });
      savePackHistoryEntry({
        label: carousel.topic,
        accountCount,
        conceptCount: 1,
        packType: "single",
      });
      setProgress(
        `Pack prêt — ${accountCount} dossiers. Publie via TikTok puis coche dans Planning.`,
      );
    } catch (error) {
      setProgress(
        error instanceof Error ? error.message : "Export impossible.",
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="k-card-glow">
      <p className="k-label mb-1">Étape 3 · Distribuer</p>
      <h2 className="k-subheading">Export multi-comptes</h2>
      <p className="k-text-muted mt-1 text-xs">
        {hasCustomImages
          ? "Pack avec tes fonds custom — variations légères par compte."
          : "Fonds auto générés — prêt à publier sans étape image."}{" "}
        <strong className="font-medium k-text">{accountCount} comptes</strong>{" "}
        configurés dans Planning.
      </p>

      <Link
        href="/planning"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium k-link"
      >
        Gérer mes comptes & horaires
        <ExternalLink className="h-3 w-3" />
      </Link>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={disabled || exporting || carousel.slides.length !== 5}
          onClick={handleExport}
          className="k-btn-primary h-11 w-full sm:flex-1 disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          Télécharger pour {accountCount} comptes
        </button>
        <button
          type="button"
          onClick={copyCaption}
          className="k-btn-secondary h-11 w-full sm:w-auto"
        >
          {copiedCaption ? (
            <Check className="h-4 w-4 k-accent" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copier la légende
        </button>
      </div>

      {progress ? (
        <p className="mt-3 text-xs k-accent">{progress}</p>
      ) : null}

      <div
        className="mt-5 rounded-xl p-3"
        style={{
          background: "var(--surface-inset)",
          border: "1px solid var(--border)",
        }}
      >
        <p className="k-subheading text-xs">Publier en 2 min</p>
        <ol className="k-text-muted mt-2 space-y-1.5 text-[11px]">
          <li>1. Dézippe — 1 dossier = 1 compte TikTok.</li>
          <li>2. TikTok → Photo → slide-1 à slide-5 → colle la légende.</li>
          <li>
            3. Coche chaque post dans{" "}
            <Link href="/planning" className="k-link">
              Planning
            </Link>{" "}
            — espace 20–45 min entre comptes.
          </li>
        </ol>
      </div>
    </section>
  );
}
