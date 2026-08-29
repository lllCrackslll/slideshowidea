"use client";

import { useMemo } from "react";
import { loadSchedule } from "@/lib/workspace/storage";
import type { ScheduledPost } from "@/lib/workspace/types";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

function summarizePosts(posts: ScheduledPost[]) {
  const byAccount: Record<
    string,
    { published: number; failed: number; lastAt?: string }
  > = {};

  for (const post of posts) {
    const cur = byAccount[post.accountId] ?? { published: 0, failed: 0 };
    if (post.status === "published") cur.published += 1;
    if (post.status === "failed") cur.failed += 1;
    if (!cur.lastAt || post.scheduledAt > cur.lastAt) cur.lastAt = post.scheduledAt;
    byAccount[post.accountId] = cur;
  }

  const published = posts.filter((p) => p.status === "published").length;
  const failed = posts.filter((p) => p.status === "failed").length;

  return { byAccount, published, failed };
}

function formatWhen(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnalyticsStep() {
  const { workspace, accounts, campaign } = useWorkspace();

  const stats = useMemo(() => {
    if (!workspace) {
      return { byAccount: {}, published: 0, failed: 0, posts: [] as ScheduledPost[] };
    }
    const posts = loadSchedule(workspace.id).filter((post) =>
      campaign ? post.campaignId === campaign.id : true,
    );
    return { ...summarizePosts(posts), posts };
  }, [workspace, campaign?.id]);

  if (!workspace) return null;

  const activeAccounts = accounts.filter(
    (acc) => (stats.byAccount[acc.id]?.published ?? 0) + (stats.byAccount[acc.id]?.failed ?? 0) > 0,
  ).length;

  return (
    <section className="k-card">
      <h2 className="k-subheading">Stats</h2>
      <p className="mt-1 text-sm k-text-muted">
        Publications enregistrées sur carrousels.studio
        {campaign ? ` · ${campaign.name}` : ""}
      </p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="k-card-flat text-center">
          <p className="k-label">Publiés</p>
          <p className="k-heading mt-1 text-lg">{stats.published}</p>
        </div>
        <div className="k-card-flat text-center">
          <p className="k-label">Échecs</p>
          <p className="k-heading mt-1 text-lg">{stats.failed}</p>
        </div>
        <div className="k-card-flat text-center">
          <p className="k-label">Comptes actifs</p>
          <p className="k-heading mt-1 text-lg">{activeAccounts}</p>
        </div>
      </div>

      {!stats.posts.length ? (
        <p className="mt-5 text-sm k-text-muted">Aucune publication pour l&apos;instant.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[360px] text-sm">
            <thead>
              <tr className="k-label border-b border-[var(--border)]">
                <th className="pb-2 text-left font-medium">Compte</th>
                <th className="pb-2 text-right font-medium">Publiés</th>
                <th className="pb-2 text-right font-medium">Échecs</th>
                <th className="pb-2 text-right font-medium">Dernier</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => {
                const row = stats.byAccount[acc.id] ?? { published: 0, failed: 0 };
                return (
                  <tr key={acc.id} className="border-b border-[var(--border)]">
                    <td className="py-3 font-medium k-text">{acc.label}</td>
                    <td className="py-3 text-right tabular-nums k-text-muted">{row.published}</td>
                    <td className="py-3 text-right tabular-nums k-text-muted">{row.failed}</td>
                    <td className="py-3 text-right text-xs k-text-muted">{formatWhen(row.lastAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
