"use client";

import { useEffect, useState } from "react";
import { loadMetrics } from "@/lib/workspace/storage";
import { useWorkspace } from "../workspace-context";

export function AnalyticsStep() {
  const { workspace, campaigns, accounts, campaign } = useWorkspace();
  const [metrics, setMetrics] = useState<
    Record<string, { views: number; engagementRate: number; promoUses: number }>
  >({});

  useEffect(() => {
    if (workspace) setMetrics(loadMetrics(workspace.id));
  }, [workspace]);

  if (!workspace) return null;

  const totalViews = Object.values(metrics).reduce((s, m) => s + m.views, 0);
  const totalPromo = Object.values(metrics).reduce((s, m) => s + m.promoUses, 0);

  return (
    <section className="k-card">
      <h2 className="k-subheading">{campaign?.name ?? "Stats"}</h2>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="k-card-flat text-center">
          <p className="k-label">Vues</p>
          <p className="k-heading mt-1 text-lg">{totalViews.toLocaleString("fr-FR")}</p>
        </div>
        <div className="k-card-flat text-center">
          <p className="k-label">Campagnes</p>
          <p className="k-heading mt-1 text-lg">{campaigns.length}</p>
        </div>
        <div className="k-card-flat text-center">
          <p className="k-label">Promo</p>
          <p className="k-heading mt-1 text-lg">{totalPromo}</p>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[360px] text-sm">
          <thead>
            <tr className="k-label border-b border-[var(--border)]">
              <th className="pb-2 text-left font-medium">Compte</th>
              <th className="pb-2 text-right font-medium">Vues</th>
              <th className="pb-2 text-right font-medium">Eng.</th>
              <th className="pb-2 text-right font-medium">Promo</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => {
              const m = metrics[acc.id] ?? {
                views: 0,
                engagementRate: 0,
                promoUses: 0,
              };
              return (
                <tr key={acc.id} className="border-b border-[var(--border)]">
                  <td className="py-3 font-medium k-text">{acc.label}</td>
                  <td className="py-3 text-right tabular-nums k-text-muted">
                    {m.views.toLocaleString("fr-FR")}
                  </td>
                  <td className="py-3 text-right tabular-nums k-text-muted">
                    {m.engagementRate}%
                  </td>
                  <td className="py-3 text-right tabular-nums k-text-muted">
                    {m.promoUses}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
