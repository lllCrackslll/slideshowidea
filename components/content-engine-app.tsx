"use client";

import { useState } from "react";
import { CaptionSection } from "@/components/caption-section";
import { ControlPanel } from "@/components/control-panel";
import { DistributionPanel } from "@/components/distribution-panel";
import { Header } from "@/components/header";
import { SlidesPreview } from "@/components/slides-preview";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { copyText } from "@/lib/clipboard";
import {
  DEFAULT_CAROUSEL,
  formatCarouselText,
} from "@/lib/content-engine";
import { mapGeneratedToCarousel } from "@/lib/map-generated-carousel";
import { getToolGuide } from "@/lib/tool-guides";
import type { GenerateResponse } from "@/lib/api-types";
import type { Carousel, FormatId, GenreId, Slide } from "@/lib/types";
import {
  downloadSlidesZip,
  slidesToExportFormat,
} from "@/utils/generateSlides";

async function fetchCarousel(
  genre: GenreId,
  format: FormatId,
): Promise<Carousel> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genre, format }),
  });

  const payload = (await response.json()) as
    | GenerateResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in payload && payload.error
        ? payload.error
        : "Impossible de générer le carrousel.",
    );
  }

  return mapGeneratedToCarousel(payload as GenerateResponse, genre);
}

export function ContentEngineApp() {
  const [format, setFormat] = useState<FormatId>("short");
  const [genre, setGenre] = useState<GenreId>(DEFAULT_CAROUSEL.genre);
  const [carousel, setCarousel] = useState<Carousel>(DEFAULT_CAROUSEL);
  const [carouselQueue, setCarouselQueue] = useState<Carousel[]>([]);
  const [activeConcept, setActiveConcept] = useState(0);
  const [busy, setBusy] = useState(false);
  const [batchLabel, setBatchLabel] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCarousel =
    carouselQueue.length > 0 ? carouselQueue[activeConcept] : carousel;

  function applyCarousel(next: Carousel, queue?: Carousel[]) {
    if (queue && queue.length > 0) {
      setCarouselQueue(queue);
      setActiveConcept(0);
      setCarousel(queue[0]);
    } else {
      setCarouselQueue([]);
      setActiveConcept(0);
      setCarousel(next);
    }
  }

  async function handleGenerate() {
    setBusy(true);
    setError(null);
    setBatchLabel(null);

    try {
      const next = await fetchCarousel(genre, format);
      applyCarousel(next);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Erreur inattendue.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateBatch(count: number) {
    setBusy(true);
    setError(null);

    try {
      const results: Carousel[] = [];
      for (let i = 0; i < count; i += 1) {
        setBatchLabel(`Concept ${i + 1}/${count}…`);
        results.push(await fetchCarousel(genre, format));
      }
      applyCarousel(results[0], results);
      setBatchLabel(`${count} concepts prêts.`);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Erreur inattendue.",
      );
    } finally {
      setBusy(false);
      window.setTimeout(() => setBatchLabel(null), 3000);
    }
  }

  function selectConcept(index: number) {
    setActiveConcept(index);
    if (carouselQueue[index]) {
      setCarousel(carouselQueue[index]);
    }
  }

  function updateActiveCarousel(updater: (current: Carousel) => Carousel) {
    const next = updater(activeCarousel);
    setCarousel(next);
    if (carouselQueue.length > 0) {
      setCarouselQueue((current) =>
        current.map((item, index) => (index === activeConcept ? next : item)),
      );
    }
  }

  async function handleCopyAll() {
    try {
      await copyText(formatCarouselText(activeCarousel));
    } finally {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  async function handleDownloadZip() {
    setExporting(true);
    setError(null);

    try {
      await downloadSlidesZip(
        slidesToExportFormat(activeCarousel.slides),
        activeCarousel.topic,
      );
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Export ZIP impossible.",
      );
    } finally {
      setExporting(false);
    }
  }

  function handleSlideChange(id: string, patch: Partial<Slide>) {
    updateActiveCarousel((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.id === id ? { ...slide, ...patch } : slide,
      ),
    }));
  }

  function handleApplyHook(hook: string) {
    const slide1 =
      activeCarousel.slides.find((s) => s.slideNumber === 1) ??
      activeCarousel.slides[0];
    if (slide1) {
      handleSlideChange(slide1.id, { text: hook });
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header
        onDownloadZip={handleDownloadZip}
        exporting={exporting}
        canDownload={activeCarousel.slides.length === 5 && !busy}
      />
      <ControlPanel
        format={format}
        genre={genre}
        busy={busy}
        copied={copied}
        error={error}
        batchLabel={batchLabel}
        onFormatChange={setFormat}
        onGenreChange={setGenre}
        onGenerate={handleGenerate}
        onGenerateBatch={() => handleGenerateBatch(3)}
        onCopyAll={handleCopyAll}
      />

      {carouselQueue.length > 1 ? (
        <div className="k-divider bg-white/50 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1400px] flex-wrap gap-2 px-4 py-3 sm:px-5">
            {carouselQueue.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectConcept(index)}
                className={`k-chip ${index === activeConcept ? "k-chip-active" : ""}`}
              >
                Concept {index + 1} · {item.topic.slice(0, 28)}
                {item.topic.length > 28 ? "…" : ""}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 py-5 sm:gap-8 sm:px-5 sm:py-6">
        <DistributionPanel
          carousel={activeCarousel}
          carouselQueue={carouselQueue}
          disabled={busy}
          onApplyHook={handleApplyHook}
        />

        <SlidesPreview
          slides={activeCarousel.slides}
          busy={busy}
          onSlideChange={handleSlideChange}
        />
        <CaptionSection
          carouselId={activeCarousel.id}
          caption={activeCarousel.caption}
          hashtags={activeCarousel.hashtags}
          onCaptionChange={(caption) =>
            updateActiveCarousel((current) => ({ ...current, caption }))
          }
        />
        {getToolGuide("/content-engine") ? (
          <ToolTutorial
            guide={getToolGuide("/content-engine")!}
            className="mb-4"
          />
        ) : null}
      </main>
    </div>
  );
}
