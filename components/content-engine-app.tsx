"use client";

import { useState } from "react";
import { CaptionSection } from "@/components/caption-section";
import { ControlPanel } from "@/components/control-panel";
import { Header } from "@/components/header";
import { SlidesPreview } from "@/components/slides-preview";
import { copyText } from "@/lib/clipboard";
import {
  DEFAULT_CAROUSEL,
  formatCarouselText,
} from "@/lib/content-engine";
import { mapGeneratedToCarousel } from "@/lib/map-generated-carousel";
import type { GenerateResponse } from "@/lib/api-types";
import type { Carousel, FormatId, GenreId, Slide } from "@/lib/types";
import {
  downloadSlidesZip,
  slidesToExportFormat,
} from "@/utils/generateSlides";

export function ContentEngineApp() {
  const [format, setFormat] = useState<FormatId>("story");
  const [genre, setGenre] = useState<GenreId>(DEFAULT_CAROUSEL.genre);
  const [carousel, setCarousel] = useState<Carousel>(DEFAULT_CAROUSEL);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setBusy(true);
    setError(null);

    try {
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

      const next = mapGeneratedToCarousel(payload as GenerateResponse, genre);
      setCarousel(next);
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

  async function handleCopyAll() {
    try {
      await copyText(formatCarouselText(carousel));
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
        slidesToExportFormat(carousel.slides),
        carousel.topic,
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
    setCarousel((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.id === id ? { ...slide, ...patch } : slide,
      ),
    }));
  }

  return (
    <div className="flex min-h-full flex-col">
      <Header
        onDownloadZip={handleDownloadZip}
        exporting={exporting}
        canDownload={carousel.slides.length === 5 && !busy}
      />
      <ControlPanel
        format={format}
        genre={genre}
        busy={busy}
        copied={copied}
        error={error}
        onFormatChange={setFormat}
        onGenreChange={setGenre}
        onGenerate={handleGenerate}
        onCopyAll={handleCopyAll}
      />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8 px-5 py-6">
        <SlidesPreview
          slides={carousel.slides}
          busy={busy}
          onSlideChange={handleSlideChange}
        />
        <CaptionSection
          carouselId={carousel.id}
          caption={carousel.caption}
          hashtags={carousel.hashtags}
          onCaptionChange={(caption) =>
            setCarousel((current) => ({ ...current, caption }))
          }
        />
      </main>
    </div>
  );
}
