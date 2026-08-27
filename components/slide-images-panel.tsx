"use client";

import { ImagePlus, X } from "lucide-react";
import { fileToDataUrl } from "@/lib/broll/custom-broll";

export type SlideImages = (string | null)[];

type SlideImagesPanelProps = {
  images: SlideImages;
  onChange: (images: SlideImages) => void;
  disabled?: boolean;
};

const EMPTY: SlideImages = [null, null, null, null, null];

export function emptySlideImages(): SlideImages {
  return [...EMPTY];
}

export function slideImagesReady(images: SlideImages): boolean {
  return images.length === 5 && images.every(Boolean);
}

export function SlideImagesPanel({
  images,
  onChange,
  disabled = false,
}: SlideImagesPanelProps) {
  const readyCount = images.filter(Boolean).length;

  async function handleUpload(slideIndex: number, files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const next = [...images] as SlideImages;
    next[slideIndex] = dataUrl;
    onChange(next);
  }

  function clearSlide(slideIndex: number) {
    const next = [...images] as SlideImages;
    next[slideIndex] = null;
    onChange(next);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-[#86868b]">
          1 image par slide — format vertical 9:16 recommandé.
        </p>
        <span className="k-badge">{readyCount}/5</span>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {images.map((src, index) => (
          <li key={index}>
            <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-wider text-[#aeaeb2]">
              Slide {index + 1}
            </p>
            {src ? (
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl ring-1 ring-[rgba(0,122,255,0.2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Slide ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => clearSlide(index)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 shadow ring-1 ring-[rgba(0,122,255,0.15)]"
                  aria-label={`Retirer slide ${index + 1}`}
                >
                  <X className="h-3 w-3 text-[#86868b]" />
                </button>
              </div>
            ) : (
              <label
                className={`flex aspect-[9/16] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(0,122,255,0.25)] bg-[rgba(0,122,255,0.03)] transition-colors hover:bg-[rgba(0,122,255,0.06)] ${disabled ? "pointer-events-none opacity-50" : ""}`}
              >
                <ImagePlus className="h-5 w-5 text-[#007aff]" />
                <span className="text-[10px] font-medium text-[#86868b]">
                  Ajouter
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={disabled}
                  onChange={(e) => {
                    void handleUpload(index, e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
