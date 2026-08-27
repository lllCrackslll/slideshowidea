"use client";

import { Check, Copy, Sparkles } from "lucide-react";
import { FORMATS, GENRES } from "@/lib/content-engine";
import type { FormatId, GenreId } from "@/lib/types";

type ControlPanelProps = {
  format: FormatId;
  genre: GenreId;
  busy: boolean;
  copied: boolean;
  error: string | null;
  batchLabel?: string | null;
  onFormatChange: (format: FormatId) => void;
  onGenreChange: (genre: GenreId) => void;
  onGenerate: () => void;
  onGenerateBatch: () => void;
  onCopyAll: () => void;
};

export function ControlPanel({
  format,
  genre,
  busy,
  copied,
  error,
  batchLabel,
  onFormatChange,
  onGenreChange,
  onGenerate,
  onGenerateBatch,
  onCopyAll,
}: ControlPanelProps) {
  return (
    <section className="k-divider bg-white/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="k-label">Format</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {FORMATS.map((item) => {
              const selected = item.id === format;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onFormatChange(item.id)}
                  className={`k-chip ${selected ? "k-chip-active" : ""}`}
                >
                  <span className="mr-1.5">{item.emoji}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="k-label">Thème</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {GENRES.map((item) => {
                const selected = item.id === genre;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onGenreChange(item.id)}
                    className={`k-chip ${selected ? "k-chip-active" : ""}`}
                  >
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onGenerateBatch}
              disabled={busy}
              className="k-btn-accent h-10"
            >
              <Sparkles className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
              3 concepts du jour
            </button>
            <button
              type="button"
              onClick={onGenerate}
              disabled={busy}
              className="k-btn-primary h-10"
            >
              <Sparkles className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
              1 concept
            </button>
            <button
              type="button"
              onClick={onCopyAll}
              className="k-btn-secondary h-10"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[#007aff]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copié" : "Copier tout le texte"}
            </button>
          </div>
        </div>

        {batchLabel ? (
          <p className="text-xs font-medium text-[#007aff]">{batchLabel}</p>
        ) : null}

        {error ? (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
