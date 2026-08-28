"use client";

import { Loader2, Package, Plus, Send } from "lucide-react";
import { useState } from "react";
import JSZip from "jszip";
import { renderCampaignSlide } from "@/lib/workspace/campaign-export";
import {
  bumpMetrics,
  loadSchedule,
  saveSchedule,
} from "@/lib/workspace/storage";
import type { ScheduledPost, TikTokAccount } from "@/lib/workspace/types";
import { useWorkspace } from "../workspace-context";

function folderSlug(label: string, i: number) {
  return (
    label
      .replace(/^@/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32) || `compte-${i + 1}`
  );
}

export function ScheduleStep() {
  const { workspace, campaign, accounts, updateAccounts, updateCampaign, setStep } =
    useWorkspace();
  const [selected, setSelected] = useState<string[]>(() => accounts.map((a) => a.id));
  const [exporting, setExporting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!campaign || !workspace) return null;

  const c = campaign;
  const ws = workspace;

  function patch(id: string, p: Partial<TikTokAccount>) {
    updateAccounts(accounts.map((a) => (a.id === id ? { ...a, ...p } : a)));
  }

  async function exportZip() {
    setExporting(true);
    setMsg(null);
    try {
      const zip = new JSZip();
      const targets = selected.length ? selected : accounts.map((a) => a.id);
      for (let i = 0; i < targets.length; i += 1) {
        const acc = accounts.find((a) => a.id === targets[i]);
        const root = zip.folder(folderSlug(acc?.label ?? `@c${i}`, i));
        if (!root) continue;
        for (const slide of c.slides) {
          const canvas = await renderCampaignSlide(slide, ws.handle);
          const blob = await new Promise<Blob>((res, rej) =>
            canvas.toBlob((b) => (b ? res(b) : rej()), "image/jpeg", 0.92),
          );
          root.file(`slide-${slide.order}.jpg`, blob);
        }
        root.file(
          "caption.txt",
          [c.caption, acc?.promoCode && `Code: ${acc.promoCode}`, acc?.storeUrl]
            .filter(Boolean)
            .join("\n"),
        );
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${c.name.slice(0, 24)}.zip`;
      a.click();
      setMsg(`${targets.length} comptes exportés`);
    } catch {
      setMsg("Erreur export");
    } finally {
      setExporting(false);
    }
  }

  function schedule() {
    const posts: ScheduledPost[] = selected.map((accountId, i) => {
      const acc = accounts.find((a) => a.id === accountId)!;
      const d = new Date();
      d.setHours(acc.publishHour, acc.publishMinute + i * 30, 0, 0);
      return {
        id: `post-${Date.now()}-${i}`,
        campaignId: c.id,
        accountId,
        scheduledAt: d.toISOString(),
        status: "queued" as const,
      };
    });
    saveSchedule(ws.id, [...loadSchedule(ws.id), ...posts]);
    updateCampaign({ ...c, status: "scheduled" });
    posts.forEach((p) => bumpMetrics(ws.id, p.accountId));
    setMsg(`${posts.length} posts programmés`);
  }

  return (
    <section className="k-card">
      <h2 className="k-subheading">Publier</h2>

      <ul className="mt-4 space-y-2">
        {accounts.map((acc) => (
          <li key={acc.id} className="k-row">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(acc.id)}
                onChange={() =>
                  setSelected((s) =>
                    s.includes(acc.id) ? s.filter((x) => x !== acc.id) : [...s, acc.id],
                  )
                }
                className="accent-[var(--accent)]"
              />
              <input
                value={acc.label}
                onChange={(e) => patch(acc.id, { label: e.target.value })}
                className="k-input h-9 min-w-0 flex-1 px-2 text-sm"
              />
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={acc.storeUrl}
                onChange={(e) => patch(acc.id, { storeUrl: e.target.value })}
                placeholder="Lien App Store"
                className="k-input h-9 text-xs"
              />
              <input
                value={acc.promoCode}
                onChange={(e) => patch(acc.id, { promoCode: e.target.value })}
                placeholder="Code promo"
                className="k-input h-9 text-xs"
              />
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() =>
          updateAccounts([
            ...accounts,
            {
              id: `acc-${Date.now()}`,
              label: `@compte-${accounts.length + 1}`,
              persona: "",
              storeUrl: "",
              promoCode: "",
              publishHour: 9,
              publishMinute: 0,
              status: "disconnected",
            },
          ])
        }
        className="k-btn-ghost mt-3"
      >
        <Plus className="h-4 w-4" />
        Compte
      </button>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          disabled={exporting}
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
        <button type="button" onClick={schedule} className="k-btn-accent flex-1">
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
