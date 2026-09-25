"use client";

import { useMemo } from "react";
import { loadSchedule } from "@/lib/workspace/storage";
import type { ScheduledPost } from "@/lib/workspace/types";
import { CampaignPicker } from "../campaign-picker";
import { useWorkspace } from "../workspace-context";

function summarizePosts(posts: ScheduledPost[]) {
  const published = posts.filter((p) => p.status === "published").length;
  const failed = posts.filter((p) => p.status === "failed").length;
  return { published, failed };
}

export function AnalyticsStep() {
  const { workspace, campaign } = useWorkspace();

  const stats = useMemo(() => {
    if (!workspace) return { published: 0, failed: 0, posts: [] as ScheduledPost[] };
    const posts = loadSchedule(workspace.id).filter((post) =>
      campaign ? post.campaignId === campaign.id : true,
    );
    return { ...summarizePosts(posts), posts };
  }, [workspace, campaign?.id]);

  if (!workspace) return null;

  return (
    <section className="k-card">
      <h2 className="k-subheading">Stats</h2>
      <p className="mt-1 text-sm k-text-muted">Exports et publications enregistrés</p>

      <div className="mt-4 max-w-sm">
        <CampaignPicker />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="k-card-flat text-center">
          <p className="k-label">Exports OK</p>
          <p className="k-heading mt-1 text-lg">{stats.published}</p>
        </div>
        <div className="k-card-flat text-center">
          <p className="k-label">Échecs</p>
          <p className="k-heading mt-1 text-lg">{stats.failed}</p>
        </div>
      </div>

      {!stats.posts.length ? (
        <p className="mt-5 text-sm k-text-muted">Aucun export pour l&apos;instant.</p>
      ) : null}
    </section>
  );
}
