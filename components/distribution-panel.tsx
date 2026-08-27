"use client";

import { Check, Copy, Loader2, Package } from "lucide-react";
import { useMemo, useState } from "react";
import {
  AccountNamesPanel,
  getAccountNames,
} from "@/components/distribution/account-names-panel";
import { BrollUploadPanel } from "@/components/distribution/broll-upload-panel";
import { DistributionSection } from "@/components/distribution/distribution-section";
import { HooksBankPanel } from "@/components/distribution/hooks-bank-panel";
import { PublishChecklistPanel } from "@/components/distribution/publish-checklist-panel";
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
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);

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

  const planSlots = useMemo(
    () =>
      buildPublishPlan({
        accountCount,
        accountNames,
        concepts: planConcepts,
        startHour: 8,
        startMinute: 0,
        intervalMinutes: 25,
      }),
    [accountCount, accountNames, planConcepts],
  );

  const sessionId = makeSessionId(
    hasQueue ? `daily-${carouselQueue.length}` : carousel.topic,
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
        setProgress(`Pack prêt — ${accountCount} comptes, ${carouselQueue.length} carrousels.`);
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
      <h2 className="k-subheading">Télécharger & publier</h2>
      <p className="mt-1 text-xs text-[#86868b]">
        1 dossier = 1 compte TikTok. Chaque dossier contient 5 images + la
        légende à coller.
      </p>

      <label className="mt-4 block text-xs text-[#86868b]">
        Nombre de comptes TikTok
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
      </label>

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
          Comment publier sur TikTok
        </p>
        <ol className="mt-2 space-y-1.5 text-[11px] text-[#86868b]">
          <li>1. Dézippe le pack — ouvre un dossier par compte.</li>
          <li>2. TikTok → Créer → Photo → importe slide-1 à slide-5.</li>
          <li>3. Colle la légende (caption.txt ou bouton ci-dessus).</li>
          <li>4. Publie, puis coche le compte dans la checklist.</li>
        </ol>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-xs font-medium text-[#1d1d1f]">
          Planning du jour
        </p>
        <ul className="max-h-40 space-y-1 overflow-y-auto">
          {planSlots.slice(0, 8).map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between rounded-lg bg-[rgba(0,122,255,0.04)] px-2.5 py-1.5 text-[11px]"
            >
              <span className="truncate text-[#424245]">{slot.accountLabel}</span>
              <span className="shrink-0 font-medium tabular-nums text-[#007aff]">
                {slot.time}
              </span>
            </li>
          ))}
          {planSlots.length > 8 ? (
            <li className="text-center text-[10px] text-[#aeaeb2]">
              +{planSlots.length - 8} autres comptes…
            </li>
          ) : null}
        </ul>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-[#1d1d1f]">
          Checklist
        </p>
        <PublishChecklistPanel sessionId={sessionId} slots={planSlots} />
      </div>

      <DistributionSection title="Options avancées" subtitle="Facultatif">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-[#1d1d1f]">
              Renommer tes comptes
            </p>
            <AccountNamesPanel
              accountCount={accountCount}
              onChange={() => setAccountsVersion((v) => v + 1)}
            />
          </div>
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
              Tes propres fonds d&apos;image
            </p>
            <BrollUploadPanel />
          </div>
        </div>
      </DistributionSection>
    </section>
  );
}
