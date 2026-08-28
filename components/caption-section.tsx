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
    <div className="space-y-4">
      <div>
        <h3 className="k-subheading mb-2 text-xs">Légende TikTok</h3>
        <EditableText
          key={`${carouselId}-caption`}
          initialValue={caption}
          onChange={onCaptionChange}
          className="k-input min-h-[100px] w-full p-3 text-sm leading-relaxed"
        />
      </div>

      <div>
        <h3 className="k-subheading mb-2 flex items-center gap-1.5 text-xs">
          <Hash className="h-3 w-3" />
          Hashtags
        </h3>
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
                  copied ? "k-chip-active" : "k-chip font-mono"
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
    </div>
  );
}
