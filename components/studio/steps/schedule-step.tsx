"use client";

import { Loader2, Package, Plus, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import JSZip from "jszip";
import { fileToDataUrl } from "@/lib/workspace/image-utils";
import {
  bumpMetrics,
  loadSchedule,
  saveSchedule,
} from "@/lib/workspace/storage";
import type { Campaign, ScheduledPost } from "@/lib/workspace/types";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

function folderSlug(label: string) {
  return (
    label
      .replace(/^@/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32) || "compte"
  );
}

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
  };
}

async function urlToBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const res = await fetch(url);
    return res.blob();
  }
  const res = await fetch(`/api/sourcing/image?url=${encodeURIComponent(url)}`);
  return res.blob();
}

export function ScheduleStep() {
  const { workspace, campaign, accounts, updateCampaign, setStep } = useWorkspace();
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!workspace) return null;

  if (!campaign) {
    return (
      <section className="k-card">
        <CampaignPicker />
      </section>
    );
  }

  const c = campaign;
  const ws = workspace;

  async function addImages(accountId: string, files: FileList) {
    const urls = await Promise.all(Array.from(files).map((f) => fileToDataUrl(f)));
    const current = getAccountImages(c, accountId);
    await updateCampaign(setAccountImages(c, accountId, [...current, ...urls]));
  }

  function removeImage(accountId: string, index: number) {
    const next = getAccountImages(c, accountId).filter((_, i) => i !== index);
    void updateCampaign(setAccountImages(c, accountId, next));
  }

  async function exportZip() {
    setExporting(true);
    setMsg(null);
    try {
      const zip = new JSZip();
      let exported = 0;

      for (const acc of accounts) {
        const images = getAccountImages(c, acc.id);
        if (!images.length) continue;
        const root = zip.folder(folderSlug(acc.label));
        if (!root) continue;
        for (let i = 0; i < images.length; i += 1) {
          const blob = await urlToBlob(images[i]);
          root.file(`slide-${i + 1}.jpg`, blob);
        }
        root.file(
          "caption.txt",
          [c.caption, acc.promoCode && `Code: ${acc.promoCode}`, acc.storeUrl]
            .filter(Boolean)
            .join("\n"),
        );
        exported += 1;
      }

      if (!exported) {
        setMsg("Ajoute des images par compte");
        return;
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${c.name.slice(0, 24)}.zip`;
      a.click();
      setMsg(`${exported} compte${exported > 1 ? "s" : ""} exporté${exported > 1 ? "s" : ""}`);
    } catch {
      setMsg("Erreur export");
    } finally {
      setExporting(false);
    }
  }

  async function schedule() {
    const posts: ScheduledPost[] = [];
    accounts.forEach((acc, i) => {
      if (!getAccountImages(c, acc.id).length) return;
      const d = new Date();
      d.setHours(acc.publishHour, acc.publishMinute + i * 30, 0, 0);
      posts.push({
        id: `post-${Date.now()}-${i}`,
        campaignId: c.id,
        accountId: acc.id,
        scheduledAt: d.toISOString(),
        status: "queued",
      });
    });

    if (!posts.length) {
      setMsg("Ajoute des images par compte");
      return;
    }

    saveSchedule(ws.id, [...loadSchedule(ws.id), ...posts]);
    await updateCampaign({ ...c, status: "scheduled" });
    posts.forEach((p) => bumpMetrics(ws.id, p.accountId));
    setMsg(`${posts.length} posts programmés`);
  }

  const filledAccounts = accounts.filter((a) => getAccountImages(c, a.id).length > 0).length;

  return (
    <section className="k-card">
      <h2 className="k-subheading">Publier</h2>
      <p className="mt-1 text-sm k-text-muted">
        Choisis ta campagne · insère les images par compte
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
                      <li
                        key={`${acc.id}-${i}`}
                        className="relative aspect-[9/16] overflow-hidden rounded-lg border border-[var(--border)]"
                      >
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
                  <p className="text-xs k-text-muted">Aucune image</p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 text-center text-xs k-text-muted">
        {filledAccounts}/{accounts.length} comptes prêts
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={exporting || filledAccounts === 0}
          onClick={() => void exportZip()}
          className="k-btn-primary flex-1"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Package className="h-4 w-4" />
          )}
          ZIP multi-comptes
        </button>
        <button
          type="button"
          disabled={filledAccounts === 0}
          onClick={() => void schedule()}
          className="k-btn-accent flex-1"
        >
          <Send className="h-4 w-4" />
          Programmer
        </button>
      </div>

      {msg ? <p className="mt-3 text-center text-xs k-accent">{msg}</p> : null}

      <button
        type="button"
        onClick={() => setStep("analytics")}
        className="k-btn-ghost mx-auto mt-4 block"
      >
        Voir stats →
      </button>
    </section>
  );
}
