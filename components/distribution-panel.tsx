"use client";

import { Check, Copy, ExternalLink, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DistributionSection } from "@/components/distribution/distribution-section";
import { HooksBankPanel } from "@/components/distribution/hooks-bank-panel";
import { getAccountNames } from "@/components/distribution/account-names-panel";
import type { SlideImages } from "@/components/slide-images-panel";
import { slideImagesReady } from "@/components/slide-images-panel";
import { copyText } from "@/lib/clipboard";
import { loadPlanningSettings } from "@/lib/distribution/planning-settings";
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
  onApplyHook?: (hook: string) => void;
};

export function DistributionPanel({
  carousel,
  slideImages,
  disabled = false,
  onApplyHook,
}: DistributionPanelProps) {
  const [planning, setPlanning] = useState(loadPlanningSettings);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const accountCount = planning.accountCount;
  const imagesReady = slideImagesReady(slideImages);

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
    if (!imagesReady) {
      setProgress("Importe les 5 images avant d'exporter.");
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
        slideBackgrounds: slideImages,
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
        `Pack prêt — ${accountCount} comptes, même carrousel, visuels uniques.`,
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
      <p className="k-label mb-1">Étape 4</p>
      <h2 className="k-subheading">Télécharger le pack</h2>
      <p className="mt-1 text-xs text-[#86868b]">
        Même texte sur{" "}
        <strong className="font-medium text-[#1d1d1f]">
          {accountCount} comptes
        </strong>{" "}
        — chaque dossier a des variations légères sur tes 5 fonds (réglé dans
        Planning).
      </p>

      <Link
        href="/planning"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#007aff] hover:underline"
      >
        Modifier mes comptes dans Planning
        <ExternalLink className="h-3 w-3" />
      </Link>

      {!imagesReady ? (
        <p className="mt-3 rounded-lg bg-[rgba(0,122,255,0.06)] px-3 py-2 text-xs text-[#007aff]">
          Importe les 5 images à l&apos;étape 3 pour débloquer l&apos;export.
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={
            disabled || exporting || carousel.slides.length !== 5 || !imagesReady
          }
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
            <Check className="h-4 w-4 text-[#007aff]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          Copier la légende
        </button>
      </div>

      {progress ? (
        <p className="mt-3 text-xs text-[#007aff]">{progress}</p>
      ) : null}

      <div className="mt-5 rounded-xl border border-[rgba(0,122,255,0.1)] bg-white/80 p-3">
        <p className="text-xs font-medium text-[#1d1d1f]">Comment publier</p>
        <ol className="mt-2 space-y-1.5 text-[11px] text-[#86868b]">
          <li>1. Dézippe — 1 dossier par compte TikTok.</li>
          <li>2. TikTok → Créer → Photo → slide-1 à slide-5.</li>
          <li>3. Colle la légende, publie sur ce compte.</li>
          <li>
            4. Répète pour chaque dossier, coche dans{" "}
            <Link href="/planning" className="text-[#007aff] hover:underline">
              Planning
            </Link>
            .
          </li>
        </ol>
      </div>

      {onApplyHook ? (
        <DistributionSection title="Options" subtitle="Facultatif">
          <div>
            <p className="mb-2 text-xs font-medium text-[#1d1d1f]">
              Accroche slide 1
            </p>
            <HooksBankPanel onApplyHook={onApplyHook} />
          </div>
        </DistributionSection>
      ) : null}
    </section>
  );
}
