"use client";

import { ArrowRight } from "lucide-react";
import { EditableText } from "@/components/editable-text";
import { slidePreviewStylePlain } from "@/lib/workspace/campaign-export";
import type { CampaignSlide, SlideFont } from "@/lib/workspace/types";
import { useWorkspace } from "../workspace-context";

export function EditorStep() {
  const { campaign, updateCampaign, setStep } = useWorkspace();
  if (!campaign) return null;

  const c = campaign;

  function patchSlide(index: number, patch: Partial<CampaignSlide>) {
    updateCampaign({
      ...c,
      slides: c.slides.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });
  }

  function patchStyle(index: number, patch: Partial<CampaignSlide["textStyle"]>) {
    patchSlide(index, {
      textStyle: { ...c.slides[index].textStyle, ...patch },
    });
  }

  return (
    <section className="k-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="k-subheading">Éditer</h2>
        {c.sourceLabel ? (
          <span className="k-badge truncate max-w-[200px]">{c.sourceLabel}</span>
        ) : null}
      </div>

      <ul className="mt-5 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {c.slides.map((slide, index) => (
          <li key={slide.id}>
            <div
              className="relative aspect-[9/16] overflow-hidden rounded-xl border border-[var(--border)]"
              style={slidePreviewStylePlain(slide.imageUrl, index)}
            >
              <div
                className="absolute inset-x-0 px-2"
                style={{
                  top: `${slide.textStyle.y}%`,
                  transform: "translateY(-50%)",
                }}
              >
                <EditableText
                  key={`${slide.id}-${slide.text}`}
                  initialValue={slide.text}
                  onChange={(text) => patchSlide(index, { text })}
                  className="w-full text-center text-sm font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
                />
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              <input
                type="number"
                min={28}
                max={72}
                value={slide.textStyle.fontSize}
                onChange={(e) =>
                  patchStyle(index, { fontSize: Number(e.target.value) })
                }
                className="k-input h-8 flex-1 px-2 text-xs"
                title="Taille"
              />
              <select
                value={slide.textStyle.fontFamily}
                onChange={(e) =>
                  patchStyle(index, {
                    fontFamily: e.target.value as SlideFont,
                  })
                }
                className="k-input h-8 flex-1 px-1 text-xs"
              >
                <option value="tiktok">TikTok</option>
                <option value="system">System</option>
              </select>
            </div>
          </li>
        ))}
      </ul>

      <textarea
        value={c.caption}
        onChange={(e) => updateCampaign({ ...c, caption: e.target.value })}
        rows={3}
        placeholder="Légende TikTok"
        className="k-input mt-5 resize-none py-3"
      />

      <button
        type="button"
        onClick={() => setStep("clean")}
        className="k-btn-primary mt-4 w-full sm:w-auto"
      >
        Suivant
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}
