"use client";

import { useWorkspace } from "./workspace-context";

export function CampaignPicker({ label = "Campagne" }: { label?: string }) {
  const { workspaces, workspace, selectApp } = useWorkspace();

  if (!workspaces.length) {
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
        value={workspace?.id ?? ""}
        onChange={(e) => selectApp(e.target.value)}
        className="k-input h-10"
      >
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>
    </label>
  );
}
