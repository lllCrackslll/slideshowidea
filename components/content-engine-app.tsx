"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { CaptionSection } from "@/components/caption-section";
import { ControlPanel } from "@/components/control-panel";
import { DistributionPanel } from "@/components/distribution-panel";
import { SlidesPreview } from "@/components/slides-preview";
import {
  SlideImagesPanel,
  emptySlideImages,
  type SlideImages,
} from "@/components/slide-images-panel";
import { DEFAULT_CAROUSEL } from "@/lib/content-engine";
import { copyText } from "@/lib/clipboard";
import { buildAllImagePrompts } from "@/lib/image-prompts";
import { mapGeneratedToCarousel } from "@/lib/map-generated-carousel";
import type { GenerateResponse } from "@/lib/api-types";
import type { Carousel, GenreId, Slide } from "@/lib/types";

async function fetchCarousel(genre: GenreId): Promise<Carousel> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genre, format: "short" }),
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
  const [genre, setGenre] = useState<GenreId>(DEFAULT_CAROUSEL.genre);
  const [carousel, setCarousel] = useState<Carousel>(DEFAULT_CAROUSEL);
  const [slideImages, setSlideImages] = useState<SlideImages>(emptySlideImages);
  const [busy, setBusy] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAllPrompts, setCopiedAllPrompts] = useState(false);

  async function handleGenerate() {
    setBusy(true);
    setError(null);

    try {
      const result = await fetchCarousel(genre);
      setCarousel(result);
      setSlideImages(emptySlideImages());
      setStatusLabel("Carrousel prêt — copie les prompts puis importe tes images.");
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Erreur inattendue.",
      );
    } finally {
      setBusy(false);
      window.setTimeout(() => setStatusLabel(null), 5000);
    }
  }

  function updateCarousel(updater: (current: Carousel) => Carousel) {
    setCarousel((current) => updater(current));
  }

  function handleSlideChange(id: string, patch: Partial<Slide>) {
    updateCarousel((current) => ({
      ...current,
      slides: current.slides.map((slide) =>
        slide.id === id ? { ...slide, ...patch } : slide,
      ),
    }));
  }

  function handleApplyHook(hook: string) {
    const slide1 =
      carousel.slides.find((s) => s.slideNumber === 1) ?? carousel.slides[0];
    if (slide1) {
      handleSlideChange(slide1.id, { text: hook });
    }
  }

  async function copyAllPrompts() {
    const prompts = buildAllImagePrompts(
      carousel.slides.map((slide) => slide.visual),
    );
    await copyText(prompts);
    setCopiedAllPrompts(true);
    window.setTimeout(() => setCopiedAllPrompts(false), 1600);
  }

  return (
    <div className="mx-auto w-full max-w-[800px] px-4 py-5 sm:px-5 sm:py-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-lg font-semibold text-[#1d1d1f] sm:text-xl">
          Crée ton carrousel TikTok
        </h1>
        <p className="mt-1 text-sm text-[#86868b]">
          4 étapes : générer → prompts → images → pack multi-comptes
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        <ControlPanel
          genre={genre}
          busy={busy}
          statusLabel={statusLabel}
          error={error}
          onGenreChange={setGenre}
          onGenerate={handleGenerate}
        />

        <section className="k-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="k-label mb-1">Étape 2</p>
              <h2 className="k-subheading">Textes & prompts image</h2>
              <p className="mt-1 text-xs text-[#86868b]">
                Édite les textes, copie chaque prompt dans ton IA (Midjourney,
                ChatGPT…), génère 5 images verticales 9:16.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyAllPrompts()}
              className="k-btn-secondary h-9 shrink-0 text-xs"
            >
              {copiedAllPrompts ? (
                <Check className="h-3.5 w-3.5 text-[#007aff]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Copier les 5 prompts
            </button>
          </div>

          <div className="mt-4">
            <SlidesPreview
              slides={carousel.slides}
              busy={busy}
              onSlideChange={handleSlideChange}
            />
          </div>

          <div className="mt-4">
            <CaptionSection
              carouselId={carousel.id}
              caption={carousel.caption}
              hashtags={carousel.hashtags}
              onCaptionChange={(caption) =>
                updateCarousel((current) => ({ ...current, caption }))
              }
            />
          </div>
        </section>

        <section className="k-card">
          <p className="k-label mb-1">Étape 3</p>
          <h2 className="k-subheading">Importer tes 5 images</h2>
          <p className="mt-1 text-xs text-[#86868b]">
            Une image par slide, dans l&apos;ordre. Elles serviront de fond pour
            tous tes comptes (avec de légères variations automatiques).
          </p>
          <div className="mt-4">
            <SlideImagesPanel
              images={slideImages}
              onChange={setSlideImages}
              disabled={busy}
            />
          </div>
        </section>

        <DistributionPanel
          carousel={carousel}
          slideImages={slideImages}
          disabled={busy}
          onApplyHook={handleApplyHook}
        />
      </div>
    </div>
  );
}
