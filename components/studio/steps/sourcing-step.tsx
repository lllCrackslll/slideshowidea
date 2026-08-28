"use client";

import { ArrowRight, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { placeholderUrl } from "@/lib/workspace/campaign-export";
import type { TikTokImportResult } from "@/lib/sourcing/types";
import { MOCK_SOURCING_FEED } from "@/lib/workspace/mock-sourcing";
import { DEFAULT_TEXT_STYLE, type Campaign, type WorkflowStep } from "@/lib/workspace/types";
import { useWorkspace } from "../workspace-context";

function applyImport(
  result: TikTokImportResult,
  campaign: Campaign,
  updateCampaign: (c: Campaign) => void,
  setStep: (s: WorkflowStep) => void,
) {
  updateCampaign({
    ...campaign,
    name: result.title.slice(0, 48),
    sourceLabel: result.title,
    slides: result.slides.map((s, i) => ({
      id: `slide-${i}`,
      order: i + 1,
      imageUrl: s.imageUrl || placeholderUrl(i),
      text: s.text,
      textStyle: { ...DEFAULT_TEXT_STYLE },
    })),
    caption: result.caption,
    hashtags: result.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)),
    status: "draft",
  });
  setStep("editor");
}

export function SourcingStep() {
  const { campaign, updateCampaign, setStep } = useWorkspace();
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  async function importFromUrl() {
    if (!campaign) return;
    const url = tiktokUrl.trim();
    if (!url) return;

    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/sourcing/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = (await res.json()) as TikTokImportResult | { error?: string };
      if (!res.ok) {
        throw new Error("error" in payload ? payload.error! : "Erreur");
      }
      applyImport(payload as TikTokImportResult, campaign, updateCampaign, setStep);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setImporting(false);
    }
  }

  function importMock(id: string) {
    if (!campaign) return;
    const item = MOCK_SOURCING_FEED.find((s) => s.id === id);
    if (!item) return;
    applyImport(
      {
        title: item.title,
        author: "",
        caption: item.caption,
        hashtags: item.hashtags,
        sourceUrl: "",
        slides: item.slides.map((s, i) => ({
          imageUrl: placeholderUrl(i),
          text: s.text,
        })),
      },
      campaign,
      updateCampaign,
      setStep,
    );
  }

  return (
    <section className="k-card">
      <h2 className="k-subheading">Importer un slideshow</h2>

      <div className="mt-4 flex gap-2">
        <input
          value={tiktokUrl}
          onChange={(e) => setTiktokUrl(e.target.value)}
          placeholder="https://tiktok.com/…"
          className="k-input flex-1"
          disabled={importing}
          onKeyDown={(e) => e.key === "Enter" && void importFromUrl()}
        />
        <button
          type="button"
          disabled={importing || !tiktokUrl.trim()}
          onClick={() => void importFromUrl()}
          className="k-btn-primary shrink-0 px-5"
        >
          {importing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          Importer
        </button>
      </div>

      {importError ? (
        <p className="mt-2 text-xs text-red-500">{importError}</p>
      ) : null}

      <button
        type="button"
        onClick={() => setShowExamples((v) => !v)}
        className="k-btn-ghost mt-4"
      >
        {showExamples ? "Masquer exemples" : "Voir exemples"}
      </button>

      {showExamples ? (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {MOCK_SOURCING_FEED.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => importMock(item.id)}
                className="k-list-item w-full text-left"
              >
                <p className="truncate text-sm font-medium k-text">{item.title}</p>
                <p className="mt-0.5 text-xs k-text-muted">
                  {(item.views / 1000).toFixed(0)}k · {item.ratio}×
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => setStep("editor")}
        className="k-btn-ghost mt-4"
      >
        Passer
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}
