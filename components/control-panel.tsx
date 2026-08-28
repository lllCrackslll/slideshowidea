"use client";

import { Sparkles } from "lucide-react";
import { GENRES } from "@/lib/content-engine";
import type { GenreId } from "@/lib/types";

type ControlPanelProps = {
  genre: GenreId;
  sourceText: string;
  busy: boolean;
  statusLabel?: string | null;
  error: string | null;
  onGenreChange: (genre: GenreId) => void;
  onSourceTextChange: (text: string) => void;
  onGenerate: () => void;
};

export function ControlPanel({
  genre,
  sourceText,
  busy,
  statusLabel,
  error,
  onGenreChange,
  onSourceTextChange,
  onGenerate,
}: ControlPanelProps) {
  const hasSource = sourceText.trim().length > 20;

  return (
    <section className="k-card">
      <p className="k-label mb-1">Étape 1 · Créer</p>
      <h2 className="k-subheading">Générer le carrousel</h2>
      <p className="mt-1 text-xs k-text-muted">
        Colle un slideshow US trouvé sur TikTok, ou laisse vide pour une idée
        originale générée par l&apos;IA.
      </p>

      <label className="mt-4 block text-xs k-text-muted">
        Source US (optionnel)
        <textarea
          value={sourceText}
          onChange={(e) => onSourceTextChange(e.target.value)}
          rows={4}
          placeholder="Colle ici le texte anglais d'un slideshow qui performe…"
          className="k-input mt-1 w-full resize-y px-3 py-2.5 text-sm leading-relaxed"
        />
      </label>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider k-text-faint">
        Angle
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
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
        onClick={onGenerate}
        disabled={busy}
        className="k-btn-primary mt-4 h-11 w-full sm:w-auto"
      >
        <Sparkles className={`h-4 w-4 ${busy ? "animate-pulse" : ""}`} />
        {busy
          ? "Génération…"
          : hasSource
            ? "Adapter en français"
            : "Générer le carrousel"}
      </button>

      {statusLabel ? (
        <p className="mt-2 text-xs font-medium k-accent">{statusLabel}</p>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
