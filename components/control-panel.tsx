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
  onFormatChange: (format: FormatId) => void;
  onGenreChange: (genre: GenreId) => void;
  onGenerate: () => void;
  onCopyAll: () => void;
};

export function ControlPanel({
  format,
  genre,
  busy,
  copied,
  error,
  onFormatChange,
  onGenreChange,
  onGenerate,
  onCopyAll,
}: ControlPanelProps) {
  return (
    <section className="border-b border-[#27272a]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
            Format
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {FORMATS.map((item) => {
              const selected = item.id === format;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onFormatChange(item.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    selected
                      ? "border-zinc-100 bg-zinc-100 font-medium text-zinc-950"
                      : "border-[#27272a] bg-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
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
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">
              Thème
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {GENRES.map((item) => {
                const selected = item.id === genre;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onGenreChange(item.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      selected
                        ? "border-zinc-100 bg-zinc-100 font-medium text-zinc-950"
                        : "border-[#27272a] bg-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span className="mr-1.5">{item.emoji}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onGenerate}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-60"
            >
              <Sparkles className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
              Générer le carrousel
            </button>
            <button
              type="button"
              onClick={onCopyAll}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#27272a] px-4 text-sm text-zinc-300 transition-colors hover:border-zinc-700 hover:bg-white/[0.03] hover:text-zinc-100"
            >
              {copied ? (
                <Check className="h-4 w-4 text-zinc-100" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copié" : "Copier tout le texte"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-xs text-red-400/90" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
