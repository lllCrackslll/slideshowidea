"use client";

import { Check, Copy, Download, Loader2, Package } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AccountNamesPanel,
  getAccountNames,
} from "@/components/distribution/account-names-panel";
import { BrollUploadPanel } from "@/components/distribution/broll-upload-panel";
import { DistributionSection } from "@/components/distribution/distribution-section";
import { HooksBankPanel } from "@/components/distribution/hooks-bank-panel";
import { PackHistoryPanel } from "@/components/distribution/pack-history-panel";
import { PublishChecklistPanel } from "@/components/distribution/publish-checklist-panel";
import { PublishPlanPanel } from "@/components/distribution/publish-plan-panel";
import { copyText } from "@/lib/clipboard";
import { makeSessionId } from "@/lib/distribution/checklist";
import { buildPublishPlan } from "@/lib/distribution/planning";
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
  const [accountCount, setAccountCount] = useState(10);
  const [accountsVersion, setAccountsVersion] = useState(0);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [intervalMinutes, setIntervalMinutes] = useState(25);
  const [exporting, setExporting] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [progress, setProgress] = useState<string | null>(null);
  const [copied, setCopied] = useState<"caption" | "hashtags" | null>(null);

  const hasQueue = carouselQueue.length > 1;

  const accountNames = useMemo(
    () => getAccountNames(accountCount),
    [accountCount, accountsVersion],
  );

  const splitPreview = hasQueue
    ? splitAccountsAcrossConcepts(carouselQueue.length, accountCount)
    : null;

  const planConcepts = useMemo(() => {
    if (!splitPreview) return undefined;
    return carouselQueue.map((item, index) => ({
      label: item.topic,
      accountCount: splitPreview[index],
    }));
  }, [carouselQueue, splitPreview]);

  const sessionId = makeSessionId(
    hasQueue ? `daily-${carouselQueue.length}` : carousel.topic,
  );

  const planSlots = useMemo(
    () =>
      buildPublishPlan({
        accountCount,
        accountNames,
        concepts: planConcepts,
        startHour,
        startMinute,
        intervalMinutes,
      }),
    [
      accountCount,
      accountNames,
      planConcepts,
      startHour,
      startMinute,
      intervalMinutes,
    ],
  );

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
        accountNames,
        onProgress: (done, total) =>
          setProgress(`Rendu visuel ${done}/${total}…`),
      });
      savePackHistoryEntry({
        label: carousel.topic,
        accountCount,
        conceptCount: 1,
        packType: "single",
      });
      setHistoryVersion((v) => v + 1);
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
        (done, total) => setProgress(`Rendu visuel ${done}/${total}…`),
      );
      savePackHistoryEntry({
        label: `Pack journalier · ${carouselQueue.map((c) => c.topic).join(", ").slice(0, 60)}`,
        accountCount,
        conceptCount: carouselQueue.length,
        packType: "daily",
      });
      setHistoryVersion((v) => v + 1);
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

  return (
    <div className="space-y-3">
      <section className="k-card-glow">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="k-subheading">Distribution TikTok</h2>
            <p className="mt-1 text-xs text-[#86868b]">
              1 dossier = 1 compte · visuels uniques · noms perso
            </p>
          </div>
          <span className="k-badge">Export</span>
        </div>

        <label className="block text-xs text-[#86868b]">
          Nombre de comptes
          <div className="mt-2 flex items-center gap-3">
            <input
              type="range"
              min={3}
              max={20}
              value={accountCount}
              onChange={(e) => setAccountCount(Number(e.target.value))}
              className="w-full accent-[#007aff]"
            />
            <span className="w-8 text-sm font-semibold text-[#1d1d1f]">
              {accountCount}
            </span>
          </div>
          {splitPreview ? (
            <p className="mt-1 text-[11px] text-[#aeaeb2]">
              Répartition :{" "}
              {splitPreview
                .map((n, i) => `Concept ${i + 1} → ${n}`)
                .join(" · ")}
            </p>
          ) : null}
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyCaption}
            className="k-btn-secondary h-9 flex-1 px-3 text-xs sm:flex-none"
          >
            {copied === "caption" ? (
              <Check className="h-3.5 w-3.5 text-[#007aff]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Légende
          </button>
          <button
            type="button"
            onClick={copyHashtags}
            className="k-btn-secondary h-9 flex-1 px-3 text-xs sm:flex-none"
          >
            {copied === "hashtags" ? (
              <Check className="h-3.5 w-3.5 text-[#007aff]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Hashtags
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            disabled={disabled || exporting || carousel.slides.length !== 5}
            onClick={exportSinglePack}
            className="k-btn-primary h-10 w-full sm:w-auto disabled:opacity-50"
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
              className="k-btn-accent h-10 w-full sm:w-auto disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Pack journalier ({carouselQueue.length})
            </button>
          ) : null}
        </div>

        {progress ? (
          <p className="mt-3 text-xs text-[#007aff]">{progress}</p>
        ) : null}
      </section>

      <DistributionSection
        title="Planning de publication"
        subtitle="Horaires décalés · affichage sur le site"
        defaultOpen
      >
        <PublishPlanPanel
          accountCount={accountCount}
          accountNames={accountNames}
          concepts={planConcepts}
          startHour={startHour}
          startMinute={startMinute}
          intervalMinutes={intervalMinutes}
          onStartHourChange={setStartHour}
          onStartMinuteChange={setStartMinute}
          onIntervalChange={setIntervalMinutes}
        />
      </DistributionSection>

      <DistributionSection
        title="Checklist publication"
        subtitle="Coche les comptes publiés"
      >
        <PublishChecklistPanel sessionId={sessionId} slots={planSlots} />
      </DistributionSection>

      <DistributionSection
        title="Comptes nommés"
        subtitle={`${accountCount} comptes TikTok`}
      >
        <AccountNamesPanel
          accountCount={accountCount}
          onChange={() => setAccountsVersion((v) => v + 1)}
        />
      </DistributionSection>

      {onApplyHook ? (
        <DistributionSection
          title="Banque de hooks"
          subtitle="50 accroches slide 1"
        >
          <HooksBankPanel onApplyHook={onApplyHook} />
        </DistributionSection>
      ) : null}

      <DistributionSection title="B-roll perso" subtitle="Tes propres fonds">
        <BrollUploadPanel />
      </DistributionSection>

      <DistributionSection title="Historique des packs" subtitle="Local">
        <PackHistoryPanel key={historyVersion} />
      </DistributionSection>
    </div>
  );
}
