"use client";

import { useWorkspace } from "./workspace-context";

export function CampaignPicker({ label = "Campagne" }: { label?: string }) {
  const { campaigns, campaign, selectCampaign } = useWorkspace();

  if (!campaigns.length) {
    return (
      <p className="text-sm k-text-muted">
        Aucune campagne — crée-en une dans{" "}
        <a href="/setup" className="k-link">
          Comptes
        </a>
        .
      </p>
    );
  }

  return (
    <label className="block">
      <span className="k-label mb-1 block">{label}</span>
      <select
        value={campaign?.id ?? ""}
        onChange={(e) => selectCampaign(e.target.value)}
        className="k-input h-10"
      >
        {campaigns.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}
