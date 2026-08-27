"use client";

import { useState } from "react";
import { Check, Hash } from "lucide-react";
import { EditableText } from "@/components/editable-text";
import { copyText } from "@/lib/clipboard";

type CaptionSectionProps = {
  carouselId: string;
  caption: string;
  hashtags: string[];
  onCaptionChange: (caption: string) => void;
};

export function CaptionSection({
  carouselId,
  caption,
  hashtags,
  onCaptionChange,
}: CaptionSectionProps) {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  async function copyTag(tag: string) {
    try {
      await copyText(tag);
    } finally {
      setCopiedTag(tag);
      window.setTimeout(() => setCopiedTag(null), 1400);
    }
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="k-card">
        <h2 className="k-label mb-3">Légende TikTok</h2>
        <EditableText
          key={`${carouselId}-caption`}
          initialValue={caption}
          onChange={onCaptionChange}
          className="min-h-[140px] text-sm leading-relaxed text-[#424245]"
        />
      </div>

      <div className="k-card">
        <h2 className="k-label mb-3 flex items-center gap-1.5">
          <Hash className="h-3 w-3" />
          Hashtags
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map((tag) => {
            const copied = copiedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => copyTag(tag)}
                title="Copier"
                className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-all ${
                  copied
                    ? "border-[#007aff] bg-[#007aff] text-white"
                    : "border-[rgba(0,122,255,0.15)] text-[#6e6e73] hover:border-[rgba(0,122,255,0.35)] hover:text-[#1d1d1f]"
                }`}
              >
                {copied ? (
                  <span className="inline-flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Copié
                  </span>
                ) : (
                  tag
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
