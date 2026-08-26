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
      <div className="rounded-xl border border-[#27272a] bg-[#0c0c0e] p-4">
        <h2 className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Légende TikTok
        </h2>
        <EditableText
          key={`${carouselId}-caption`}
          initialValue={caption}
          onChange={onCaptionChange}
          className="min-h-[140px] text-sm leading-relaxed text-zinc-300"
        />
      </div>

      <div className="rounded-xl border border-[#27272a] bg-[#0c0c0e] p-4">
        <h2 className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
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
                className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                  copied
                    ? "border-zinc-500 bg-zinc-100 text-zinc-950"
                    : "border-[#27272a] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
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
