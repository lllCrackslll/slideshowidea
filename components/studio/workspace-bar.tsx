"use client";

import { Plus } from "lucide-react";
import { useWorkspace } from "./workspace-context";

export function WorkspaceBar() {
  const {
    workspaces,
    workspace,
    campaigns,
    campaign,
    selectWorkspace,
    selectCampaign,
    addWorkspace,
    addCampaign,
    updateWorkspace,
  } = useWorkspace();

  if (!workspace) return null;

  return (
    <div className="k-card-flat mb-5 flex flex-wrap items-end gap-3">
      <label className="min-w-[120px] flex-1">
        <span className="k-label mb-1 block">App</span>
        <select
          value={workspace.id}
          onChange={(e) => selectWorkspace(e.target.value)}
          className="k-input h-10"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </label>

      <label className="min-w-[120px] flex-1">
        <span className="k-label mb-1 block">Campagne</span>
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

      <label className="min-w-[100px] flex-1">
        <span className="k-label mb-1 block">@handle</span>
        <input
          value={workspace.handle}
          onChange={(e) => updateWorkspace({ handle: e.target.value })}
          className="k-input h-10"
        />
      </label>

      <div className="flex gap-2 pb-0.5">
        <button
          type="button"
          onClick={() => addCampaign(`Campagne ${campaigns.length + 1}`)}
          className="k-btn-secondary h-10 px-3"
          title="Nouvelle campagne"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => addWorkspace(`App ${workspaces.length + 1}`)}
          className="k-btn-secondary h-10 px-3"
          title="Nouvelle app"
        >
          <Plus className="h-4 w-4" />
          App
        </button>
      </div>
    </div>
  );
}
