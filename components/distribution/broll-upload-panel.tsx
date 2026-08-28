"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addCustomBrollFile,
  loadCustomBroll,
  removeCustomBrollAt,
  type BrollPools,
} from "@/lib/broll/custom-broll";
import {
  BROLL_CATEGORY_LABELS,
  type BrollCategory,
} from "@/lib/distribution/types";

const CATEGORIES: BrollCategory[] = ["hook", "content", "app", "cta"];

export function BrollUploadPanel() {
  const [pools, setPools] = useState<BrollPools>({
    hook: [],
    content: [],
    app: [],
    cta: [],
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPools(loadCustomBroll());
  }, []);

  async function handleUpload(
    category: BrollCategory,
    files: FileList | null,
  ) {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const next = await addCustomBrollFile(file, category);
      setPools(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-[11px] k-text-muted">
        Ajoute tes propres fonds (JPG/PNG). Mélangés avec les b-roll par défaut
        à l&apos;export.
      </p>

      {CATEGORIES.map((category) => (
        <div key={category}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium k-text">
              {BROLL_CATEGORY_LABELS[category]}
            </span>
            <label className="k-btn-secondary h-8 cursor-pointer px-2.5 text-[11px]">
              <ImagePlus className="h-3.5 w-3.5" />
              Ajouter
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  void handleUpload(category, e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {pools[category].length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pools[category].map((src, index) => (
                <div key={`${category}-${index}`} className="relative shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-16 w-10 rounded-lg object-cover ring-1 ring-[rgba(0,122,255,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setPools(removeCustomBrollAt(category, index))}
                    className="absolute -right-1 -top-1 k-theme-toggle h-5 w-5 p-0"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[10px] k-text-faint">Aucun fond perso.</p>
          )}
        </div>
      ))}
    </div>
  );
}
