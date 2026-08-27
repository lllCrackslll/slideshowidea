"use client";

import { Check, Copy, ExternalLink, Loader2, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DistributionSection } from "@/components/distribution/distribution-section";
import { BrollUploadPanel } from "@/components/distribution/broll-upload-panel";
import { HooksBankPanel } from "@/components/distribution/hooks-bank-panel";
import { getAccountNames } from "@/components/distribution/account-names-panel";
import { copyText } from "@/lib/clipboard";
import { loadPlanningSettings } from "@/lib/distribution/planning-settings";
import { savePackHistoryEntry } from "@/lib/distribution/pack-history";
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
  onApplyHook?: (hook: string) => void;
};

export function DistributionPanel({
  carousel,
  carouselQueue = [],
  disabled = false,
  onApplyHook,
}: DistributionPanelProps) {
  const [planning, setPlanning] = useState(loadPlanningSettings);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

  const hasQueue = carouselQueue.length > 1;
  const accountCount = planning.accountCount;

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
    setExporting(true);
    setProgress("Préparation du pack…");

    try {
      if (hasQueue) {
        const splits = splitAccountsAcrossConcepts(
          carouselQueue.length,
          accountCount,
        );
        let offset = 0;
        await downloadDailyPack(
          carouselQueue.map((item, index) => {
            const entry = {
              topicTitle: item.topic,
              caption: item.caption,
              hashtags: item.hashtags,
              slides: slidesToExportFormat(item.slides),
              accountCount: splits[index],
              accountNames,
              accountOffset: offset,
            };
            offset += splits[index];
            return entry;
          }),
          (done, total) => setProgress(`Création des visuels ${done}/${total}…`),
        );
        savePackHistoryEntry({
          label: `Pack du jour · ${carouselQueue.length} carrousels`,
          accountCount,
          conceptCount: carouselQueue.length,
          packType: "daily",
        });
        setProgress(
          `Pack prêt — ${accountCount} comptes, ${carouselQueue.length} carrousels.`,
        );
      } else {
        await downloadDistributionPack({
          slides: slidesToExportFormat(carousel.slides),
          topicTitle: carousel.topic,
          caption: carousel.caption,
          hashtags: carousel.hashtags,
          accountCount,
          accountNames,
          onProgress: (done, total) =>
            setProgress(`Création des visuels ${done}/${total}…`),
        });
        savePackHistoryEntry({
          label: carousel.topic,
          accountCount,
          conceptCount: 1,
          packType: "single",
        });
        setProgress(`Pack prêt — ${accountCount} comptes.`);
      }
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
      <p className="k-label mb-1">Étape 3</p>
      <h2 className="k-subheading">Télécharger</h2>
      <p className="mt-1 text-xs text-[#86868b]">
        Export pour{" "}
        <strong className="font-medium text-[#1d1d1f]">
          {accountCount} comptes
        </strong>{" "}
        (réglé dans Planning). 1 dossier = 5 images + légende.
      </p>

      <Link
        href="/planning"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#007aff] hover:underline"
      >
        Modifier mes comptes dans Planning
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
          Télécharger le pack
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
        <p className="text-xs font-medium text-[#1d1d1f]">
          Comment publier
        </p>
        <ol className="mt-2 space-y-1.5 text-[11px] text-[#86868b]">
          <li>1. Dézippe — 1 dossier par compte.</li>
          <li>2. TikTok → Créer → Photo → slide-1 à slide-5.</li>
          <li>3. Colle la légende, publie.</li>
          <li>
            4. Coche dans{" "}
            <Link href="/planning" className="text-[#007aff] hover:underline">
              Planning
            </Link>
            .
          </li>
        </ol>
      </div>

      <DistributionSection title="Options" subtitle="Facultatif">
        <div className="space-y-4">
          {onApplyHook ? (
            <div>
              <p className="mb-2 text-xs font-medium text-[#1d1d1f]">
                Accroche slide 1
              </p>
              <HooksBankPanel onApplyHook={onApplyHook} />
            </div>
          ) : null}
          <div>
            <p className="mb-2 text-xs font-medium text-[#1d1d1f]">
              Fonds d&apos;image perso
            </p>
            <BrollUploadPanel />
          </div>
        </div>
      </DistributionSection>
    </section>
  );
}
