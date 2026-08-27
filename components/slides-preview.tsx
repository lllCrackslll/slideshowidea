"use client";

import { SlideCard } from "@/components/slide-card";
import type { Slide } from "@/lib/types";

type SlidesPreviewProps = {
  slides: Slide[];
  busy: boolean;
  onSlideChange: (id: string, patch: Partial<Slide>) => void;
};

export function SlidesPreview({
  slides,
  busy,
  onSlideChange,
}: SlidesPreviewProps) {
  return (
    <section className="min-w-0">
      <div
        className={`slides-scroll flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory transition-opacity ${
          busy ? "pointer-events-none opacity-40" : "opacity-100"
        }`}
      >
        {slides.map((slide, index) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            index={index}
            total={slides.length}
            onChange={(patch) => onSlideChange(slide.id, patch)}
          />
        ))}
      </div>
    </section>
  );
}
