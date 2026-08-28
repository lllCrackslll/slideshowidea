"use client";

import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { isGradientPlaceholder } from "@/lib/workspace/campaign-export";
import { cleanAllSlides } from "@/lib/workspace/slide-clean";
import { useWorkspace } from "../workspace-context";

export function CleanStep() {
  const { campaign, updateCampaign, setStep } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(Boolean(campaign?.cleanedAt));

  if (!campaign) return null;

  async function runClean() {
    if (!campaign) return;
    setBusy(true);
    try {
      const toClean = campaign.slides
        .map((s) => s.imageUrl)
        .filter((u) => u && !isGradientPlaceholder(u));
      const cleanedMap = new Map<string, string>();
      if (toClean.length) {
        const cleaned = await cleanAllSlides(toClean);
        toClean.forEach((url, i) => cleanedMap.set(url, cleaned[i]));
      }
      updateCampaign({
        ...campaign,
        slides: campaign.slides.map((s) =>
          s.imageUrl && cleanedMap.has(s.imageUrl)
            ? { ...s, imageUrl: cleanedMap.get(s.imageUrl)! }
            : s,
        ),
        status: "ready",
        cleanedAt: new Date().toISOString(),
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="k-card text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)]">
        <ShieldCheck className="h-7 w-7 k-accent" />
      </div>
      <h2 className="k-subheading mt-4">Anti-doublon</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm k-text-muted">
        EXIF supprimé · pixels altérés · prêt à publier
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => void runClean()}
        className="k-btn-primary mt-6 w-full sm:mx-auto sm:w-auto sm:min-w-[200px]"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {done ? "Re-traiter" : "Lancer"}
      </button>

      {done ? (
        <p className="mt-3 text-xs k-accent">OK</p>
      ) : null}

      <button
        type="button"
        onClick={() => setStep("schedule")}
        className="k-btn-secondary mt-3 w-full sm:mx-auto sm:w-auto"
      >
        Suivant
        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}
