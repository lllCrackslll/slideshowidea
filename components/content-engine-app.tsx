"use client";

import { useState } from "react";
import { CaptionSection } from "@/components/caption-section";
import { ControlPanel } from "@/components/control-panel";
import { DistributionPanel } from "@/components/distribution-panel";
import { SlidesPreview } from "@/components/slides-preview";
import {
  DEFAULT_CAROUSEL,
} from "@/lib/content-engine";
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
  const [carouselQueue, setCarouselQueue] = useState<Carousel[]>([]);
  const [activeConcept, setActiveConcept] = useState(0);
  const [busy, setBusy] = useState(false);
  const [batchLabel, setBatchLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCarousel =
    carouselQueue.length > 0 ? carouselQueue[activeConcept] : carousel;

  async function handleGenerateBatch() {
    setBusy(true);
    setError(null);

    try {
      const results: Carousel[] = [];
      for (let i = 0; i < 3; i += 1) {
        setBatchLabel(`Carrousel ${i + 1}/3…`);
        results.push(await fetchCarousel(genre));
      }
      setCarouselQueue(results);
      setActiveConcept(0);
      setCarousel(results[0]);
      setBatchLabel("3 carrousels prêts — passe à l'étape 2.");
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "Erreur inattendue.",
      );
    } finally {
      setBusy(false);
      window.setTimeout(() => setBatchLabel(null), 4000);
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
    <div className="mx-auto w-full max-w-[800px] px-4 py-5 sm:px-5 sm:py-8">
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="text-lg font-semibold text-[#1d1d1f] sm:text-xl">
          Crée tes carrousels TikTok
        </h1>
        <p className="mt-1 text-sm text-[#86868b]">
          3 étapes : générer → éditer → télécharger
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        <ControlPanel
          genre={genre}
          busy={busy}
          batchLabel={batchLabel}
          error={error}
          onGenreChange={setGenre}
          onGenerateBatch={handleGenerateBatch}
        />

        <section className="k-card">
          <p className="k-label mb-1">Étape 2</p>
          <h2 className="k-subheading">Vérifier & éditer</h2>
          <p className="mt-1 text-xs text-[#86868b]">
            Clique sur un texte pour le modifier. Change de carrousel avec les
            onglets.
          </p>

          {carouselQueue.length > 1 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {carouselQueue.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectConcept(index)}
                  className={`k-chip ${index === activeConcept ? "k-chip-active" : ""}`}
                >
                  Carrousel {index + 1}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4">
            <SlidesPreview
              slides={activeCarousel.slides}
              busy={busy}
              onSlideChange={handleSlideChange}
            />
          </div>

          <div className="mt-4">
            <CaptionSection
              carouselId={activeCarousel.id}
              caption={activeCarousel.caption}
              hashtags={activeCarousel.hashtags}
              onCaptionChange={(caption) =>
                updateActiveCarousel((current) => ({ ...current, caption }))
              }
            />
          </div>
        </section>

        <DistributionPanel
          carousel={activeCarousel}
          carouselQueue={carouselQueue}
          disabled={busy}
          onApplyHook={handleApplyHook}
        />
      </div>
    </div>
  );
}
