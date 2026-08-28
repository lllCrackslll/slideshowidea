"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { AppProfilePanel } from "@/components/app-profile-panel";
import { CaptionSection } from "@/components/caption-section";
import { ControlPanel } from "@/components/control-panel";
import { DistributionPanel } from "@/components/distribution-panel";
import { SlidesPreview } from "@/components/slides-preview";
import {
  SlideImagesPanel,
  emptySlideImages,
  type SlideImages,
} from "@/components/slide-images-panel";
import { DEFAULT_APP_PROFILE, loadAppProfile, type AppProfile } from "@/lib/app-profile";
import { DEFAULT_CAROUSEL } from "@/lib/content-engine";
import { copyText } from "@/lib/clipboard";
import { buildAllImagePrompts } from "@/lib/image-prompts";
import { mapGeneratedToCarousel } from "@/lib/map-generated-carousel";
import type { GenerateResponse } from "@/lib/api-types";
import type { Carousel, GenreId, Slide } from "@/lib/types";

async function fetchCarousel(
  genre: GenreId,
  profile: AppProfile,
  sourceText: string,
): Promise<Carousel> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      genre,
      format: "short",
      profile,
      sourceText: sourceText.trim() || undefined,
    }),
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
  const [profile, setProfile] = useState<AppProfile>(DEFAULT_APP_PROFILE);
  const [genre, setGenre] = useState<GenreId>(DEFAULT_CAROUSEL.genre);
  const [sourceText, setSourceText] = useState("");
  const [carousel, setCarousel] = useState<Carousel>(DEFAULT_CAROUSEL);
  const [slideImages, setSlideImages] = useState<SlideImages>(emptySlideImages);
  const [busy, setBusy] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedAllPrompts, setCopiedAllPrompts] = useState(false);

  useEffect(() => {
    setProfile(loadAppProfile());
  }, []);

  async function handleGenerate() {
    setBusy(true);
    setError(null);

    try {
      const result = await fetchCarousel(genre, profile, sourceText);
      setCarousel(result);
      setSlideImages(emptySlideImages());
      setStatusLabel(
        sourceText.trim()
          ? "Carrousel adapté — vérifie les textes puis exporte."
          : "Carrousel prêt — exporte directement ou ajoute tes propres fonds.",
      );
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
        <h1 className="k-heading text-lg sm:text-xl">Studio carrousel</h1>
        <p className="k-text-muted mt-1 text-sm">
          De l&apos;idée US au pack multi-comptes — 3 étapes
        </p>
      </div>

      <div className="flex flex-col gap-5 sm:gap-6">
        <AppProfilePanel onChange={setProfile} />

        <ControlPanel
          genre={genre}
          sourceText={sourceText}
          busy={busy}
          statusLabel={statusLabel}
          error={error}
          onGenreChange={setGenre}
          onSourceTextChange={setSourceText}
          onGenerate={handleGenerate}
        />

        <section className="k-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="k-label mb-1">Étape 2 · Affiner</p>
              <h2 className="k-subheading">Textes & visuels</h2>
              <p className="mt-1 text-xs k-text-muted">
                Édite les slides et la légende. Les fonds sont générés
                automatiquement — importe tes images seulement si tu veux un
                style custom.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void copyAllPrompts()}
              className="k-btn-secondary h-9 shrink-0 text-xs"
            >
              {copiedAllPrompts ? (
                <Check className="h-3.5 w-3.5 k-accent" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              Prompts image
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

          <div className="mt-5 k-divider pt-5">
            <p className="k-label mb-2">Fonds personnalisés (optionnel)</p>
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
        />
      </div>
    </div>
  );
}
