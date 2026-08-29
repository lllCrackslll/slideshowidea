"use client";

import { Loader2, Plus, ShieldCheck, X } from "lucide-react";
import { useRef, useState } from "react";
import { fileToDataUrl } from "@/lib/workspace/image-utils";
import { cleanAllSlides } from "@/lib/workspace/slide-clean";
import type { Campaign } from "@/lib/workspace/types";
import { AiPromptsBlock } from "../ai-prompts-block";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

function getAccountImages(campaign: Campaign, accountId: string): string[] {
  return campaign.accountMedia?.[accountId] ?? [];
}

function setAccountImages(
  campaign: Campaign,
  accountId: string,
  urls: string[],
): Campaign {
  return {
    ...campaign,
    accountMedia: { ...campaign.accountMedia, [accountId]: urls },
    cleanedAt: undefined,
    status: "draft",
  };
}

export function CleanStep() {
  const { campaign, accounts, updateCampaign } = useWorkspace();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(Boolean(campaign?.cleanedAt));
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!campaign) {
    return (
      <section className="k-card">
        <CampaignPicker />
      </section>
    );
  }

  const c = campaign;

  async function addImages(accountId: string, files: FileList) {
    const urls = await Promise.all(Array.from(files).map((f) => fileToDataUrl(f)));
    const current = getAccountImages(c, accountId);
    await updateCampaign(setAccountImages(c, accountId, [...current, ...urls]));
    setDone(false);
  }

  function removeImage(accountId: string, index: number) {
    const next = getAccountImages(c, accountId).filter((_, i) => i !== index);
    void updateCampaign(setAccountImages(c, accountId, next));
    setDone(false);
  }

  async function runClean() {
    const allUrls = accounts.flatMap((acc) => getAccountImages(c, acc.id));
    if (!allUrls.length) return;

    setBusy(true);
    try {
      const cleaned = await cleanAllSlides(allUrls);
      const cleanedMap = new Map(allUrls.map((url, i) => [url, cleaned[i]]));
      const accountMedia: Record<string, string[]> = {};

      for (const acc of accounts) {
        accountMedia[acc.id] = getAccountImages(c, acc.id).map(
          (url) => cleanedMap.get(url) ?? url,
        );
      }

      await updateCampaign({
        ...c,
        accountMedia,
        importedAsIs: true,
        status: "ready",
        cleanedAt: new Date().toISOString(),
      });
      setDone(true);
    } finally {
      setBusy(false);
    }
  }

  const filledAccounts = accounts.filter((a) => getAccountImages(c, a.id).length > 0).length;

  return (
    <>
      <AiPromptsBlock />
      <section className="k-card">
        <h2 className="k-subheading">Clean</h2>
        <p className="mt-1 text-sm k-text-muted">
          {accounts.length} compte{accounts.length > 1 ? "s" : ""} · 1 emplacement par compte
        </p>

        <div className="mt-4 max-w-sm">
          <CampaignPicker />
        </div>

        {!accounts.length ? (
          <p className="mt-4 text-sm k-text-muted">
            Ajoute des comptes dans{" "}
            <a href="/setup" className="k-link">
              Comptes
            </a>
            .
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {accounts.map((acc) => {
              const images = getAccountImages(c, acc.id);
              return (
                <li key={acc.id} className="k-row">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium k-text">{acc.label}</p>
                    <button
                      type="button"
                      onClick={() => inputRefs.current[acc.id]?.click()}
                      className="k-btn-ghost py-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Ajouter
                    </button>
                    <input
                      ref={(el) => {
                        inputRefs.current[acc.id] = el;
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files?.length) void addImages(acc.id, e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </div>

                  {images.length ? (
                    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {images.map((url, i) => (
                        <li key={`${acc.id}-${i}`} className="relative aspect-[9/16] overflow-hidden rounded-lg border border-[var(--border)]">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(acc.id, i)}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button
                      type="button"
                      onClick={() => inputRefs.current[acc.id]?.click()}
                      className="k-slide-slot-empty w-full max-w-[120px]"
                    >
                      <Plus className="h-5 w-5 k-text-muted" />
                      <span className="text-[10px] k-text-muted">Slides IA</span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-4 text-center text-xs k-text-muted">
          {filledAccounts}/{accounts.length} comptes remplis
        </p>

        <button
          type="button"
          disabled={busy || filledAccounts === 0}
          onClick={() => void runClean()}
          className="k-btn-primary mx-auto mt-4 flex sm:min-w-[220px]"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {done ? "Re-clean" : "Lancer le clean"}
        </button>

        {done ? <p className="mt-3 text-center text-xs k-accent">Clean terminé</p> : null}
      </section>
    </>
  );
}
