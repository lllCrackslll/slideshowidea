"use client";

import { ImageIcon } from "lucide-react";
import { EditableText } from "@/components/editable-text";
import type { Slide } from "@/lib/types";

type SlideCardProps = {
  slide: Slide;
  index: number;
  total: number;
  onChange: (patch: Partial<Slide>) => void;
};

export function SlideCard({ slide, index, total, onChange }: SlideCardProps) {
  return (
    <article className="relative w-[210px] shrink-0 snap-start overflow-hidden rounded-[1.35rem] border border-[#27272a] bg-[#0c0c0e] sm:w-[230px]">
      <div className="relative aspect-[9/16]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.05),transparent_58%)]" />

        <div className="absolute left-4 right-4 top-4 z-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            Slide {index + 1}/{total}
          </p>
        </div>

        <div className="absolute inset-x-4 top-[18%] bottom-[30%] z-10 flex items-center">
          <EditableText
            key={`${slide.id}-text`}
            initialValue={slide.text}
            onChange={(text) => onChange({ text })}
            className="w-full px-1 text-[17px] font-medium leading-[1.35] tracking-[-0.03em] text-zinc-50"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-black/55 px-3.5 py-3 backdrop-blur-sm">
          <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
            <ImageIcon className="h-3 w-3" />
            Idée de visuel
          </div>
          <EditableText
            key={`${slide.id}-visual`}
            initialValue={slide.visual}
            onChange={(visual) => onChange({ visual })}
            className="text-[11px] leading-relaxed text-zinc-300"
          />
        </div>
      </div>
    </article>
  );
}
