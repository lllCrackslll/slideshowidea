"use client";

import { Sparkles } from "lucide-react";
import { GENRES } from "@/lib/content-engine";
import type { GenreId } from "@/lib/types";

type ControlPanelProps = {
  genre: GenreId;
  busy: boolean;
  batchLabel?: string | null;
  error: string | null;
  onGenreChange: (genre: GenreId) => void;
  onGenerateBatch: () => void;
};

export function ControlPanel({
  genre,
  busy,
  batchLabel,
  error,
  onGenreChange,
  onGenerateBatch,
}: ControlPanelProps) {
  return (
    <section className="k-card">
      <p className="k-label mb-1">Étape 1</p>
      <h2 className="k-subheading">Générer tes carrousels</h2>
      <p className="mt-1 text-xs text-[#86868b]">
        Choisis un thème, puis lance la génération de 3 carrousels prêts à
        publier.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
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

      <button
        type="button"
        onClick={onGenerateBatch}
        disabled={busy}
        className="k-btn-primary mt-4 h-11 w-full sm:w-auto"
      >
        <Sparkles className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
        {busy ? "Génération en cours…" : "Générer 3 carrousels"}
      </button>

      {batchLabel ? (
        <p className="mt-2 text-xs font-medium text-[#007aff]">{batchLabel}</p>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
