"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "@/components/studio/workspace-context";
import type { Campaign, TikTokAccount, Workspace } from "@/lib/workspace/types";

function RowActions({
  onSave,
  onDelete,
  editing,
  onEdit,
  onCancel,
}: {
  onSave: () => void;
  onDelete: () => void;
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
}) {
  if (editing) {
    return (
      <div className="flex gap-2">
        <button type="button" onClick={onSave} className="k-btn-primary h-9 px-3 text-xs">
          OK
        </button>
        <button type="button" onClick={onCancel} className="k-btn-ghost h-9 px-2 text-xs">
          Annuler
        </button>
      </div>
    );
  }
  return (
    <div className="flex gap-1">
      <button type="button" onClick={onEdit} className="k-btn-ghost h-9 w-9 p-0" title="Modifier">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={onDelete} className="k-btn-ghost h-9 w-9 p-0 text-red-500" title="Supprimer">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function SetupApp() {
  const {
    ready,
    workspaces,
    workspace,
    campaigns,
    accounts,
    selectWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    updateAccounts,
  } = useWorkspace();

  const [newApp, setNewApp] = useState("");
  const [newCamp, setNewCamp] = useState("");
  const [editWs, setEditWs] = useState<Workspace | null>(null);
  const [editCamp, setEditCamp] = useState<Campaign | null>(null);
  const [editAcc, setEditAcc] = useState<TikTokAccount | null>(null);

  if (!ready) {
    return <div className="k-page py-20 text-center text-sm k-text-muted">…</div>;
  }

  if (!workspace) return null;

  function saveWorkspace() {
    if (!editWs) return;
    updateWorkspace({ name: editWs.name, handle: editWs.handle, niche: editWs.niche });
    setEditWs(null);
  }

  async function saveCampaign() {
    if (!editCamp) return;
    await updateCampaign(editCamp);
    setEditCamp(null);
  }

  function saveAccount() {
    if (!editAcc) return;
    updateAccounts(accounts.map((a) => (a.id === editAcc.id ? editAcc : a)));
    setEditAcc(null);
  }

  function addAccount() {
    updateAccounts([
      ...accounts,
      {
        id: `acc-${Date.now()}`,
        label: `@compte-${String(accounts.length + 1).padStart(2, "0")}`,
        persona: "",
        storeUrl: "",
        promoCode: "",
        publishHour: 9,
        publishMinute: 0,
        status: "disconnected",
      },
    ]);
  }

  return (
    <div className="k-page space-y-6 pb-10">
      <header>
        <h1 className="k-heading">Comptes & campagnes</h1>
        <p className="mt-1 text-sm k-text-muted">Gère ton app, tes campagnes et tes comptes TikTok</p>
      </header>

      {/* Apps */}
      <section className="k-card">
        <h2 className="k-subheading">App</h2>
        <ul className="mt-4 space-y-2">
          {workspaces.map((ws) => (
            <li key={ws.id} className="k-row flex flex-wrap items-center gap-3">
              {editWs?.id === ws.id ? (
                <>
                  <input
                    value={editWs.name}
                    onChange={(e) => setEditWs({ ...editWs, name: e.target.value })}
                    className="k-input h-9 flex-1 min-w-[120px]"
                    placeholder="Nom app"
                  />
                  <input
                    value={editWs.handle}
                    onChange={(e) => setEditWs({ ...editWs, handle: e.target.value })}
                    className="k-input h-9 flex-1 min-w-[100px]"
                    placeholder="@handle"
                  />
                  <RowActions
                    editing
                    onSave={saveWorkspace}
                    onCancel={() => setEditWs(null)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => selectWorkspace(ws.id)}
                    className={`flex-1 text-left text-sm font-medium ${workspace.id === ws.id ? "k-accent" : "k-text"}`}
                  >
                    {ws.name}
                    <span className="ml-2 text-xs k-text-muted">{ws.handle}</span>
                  </button>
                  <RowActions
                    editing={false}
                    onEdit={() => setEditWs({ ...ws })}
                    onDelete={() => {
                      if (workspaces.length <= 1) return;
                      if (confirm(`Supprimer « ${ws.name} » ?`)) deleteWorkspace(ws.id);
                    }}
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            value={newApp}
            onChange={(e) => setNewApp(e.target.value)}
            placeholder="Nouvelle app"
            className="k-input h-10 flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (newApp.trim()) addWorkspace(newApp.trim());
              setNewApp("");
            }}
            className="k-btn-secondary h-10 px-3"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Campagnes */}
      <section className="k-card">
        <h2 className="k-subheading">Campagnes</h2>
        <ul className="mt-4 space-y-2">
          {campaigns.map((camp) => (
            <li key={camp.id} className="k-row flex flex-wrap items-center gap-3">
              {editCamp?.id === camp.id ? (
                <>
                  <input
                    value={editCamp.name}
                    onChange={(e) => setEditCamp({ ...editCamp, name: e.target.value })}
                    className="k-input h-9 flex-1"
                  />
                  <RowActions
                    editing
                    onSave={() => void saveCampaign()}
                    onCancel={() => setEditCamp(null)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium k-text">{camp.name}</span>
                  <span className="text-xs k-text-muted">{camp.status}</span>
                  <RowActions
                    editing={false}
                    onEdit={() => setEditCamp({ ...camp })}
                    onDelete={() => {
                      if (campaigns.length <= 1) return;
                      if (confirm(`Supprimer « ${camp.name} » ?`)) deleteCampaign(camp.id);
                    }}
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            value={newCamp}
            onChange={(e) => setNewCamp(e.target.value)}
            placeholder="Nouvelle campagne"
            className="k-input h-10 flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (newCamp.trim()) void addCampaign(newCamp.trim());
              setNewCamp("");
            }}
            className="k-btn-secondary h-10 px-3"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Comptes TikTok */}
      <section className="k-card">
        <h2 className="k-subheading">Comptes TikTok</h2>
        <p className="mt-1 text-xs k-text-muted">{accounts.length} compte{accounts.length > 1 ? "s" : ""}</p>
        <ul className="mt-4 space-y-3">
          {accounts.map((acc) => (
            <li key={acc.id} className="k-row">
              {editAcc?.id === acc.id ? (
                <div className="space-y-2">
                  <input
                    value={editAcc.label}
                    onChange={(e) => setEditAcc({ ...editAcc, label: e.target.value })}
                    className="k-input h-9"
                    placeholder="@handle"
                  />
                  <input
                    value={editAcc.storeUrl}
                    onChange={(e) => setEditAcc({ ...editAcc, storeUrl: e.target.value })}
                    className="k-input h-9 text-xs"
                    placeholder="Lien App Store"
                  />
                  <input
                    value={editAcc.promoCode}
                    onChange={(e) => setEditAcc({ ...editAcc, promoCode: e.target.value })}
                    className="k-input h-9 text-xs"
                    placeholder="Code promo"
                  />
                  <RowActions
                    editing
                    onSave={saveAccount}
                    onCancel={() => setEditAcc(null)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium k-text">{acc.label}</p>
                    {acc.storeUrl ? (
                      <p className="mt-0.5 truncate text-xs k-text-muted">{acc.storeUrl}</p>
                    ) : null}
                    {acc.promoCode ? (
                      <p className="text-xs k-text-muted">Code: {acc.promoCode}</p>
                    ) : null}
                  </div>
                  <RowActions
                    editing={false}
                    onEdit={() => setEditAcc({ ...acc })}
                    onDelete={() => {
                      if (accounts.length <= 1) return;
                      if (confirm(`Supprimer ${acc.label} ?`)) {
                        updateAccounts(accounts.filter((a) => a.id !== acc.id));
                      }
                    }}
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        <button type="button" onClick={addAccount} className="k-btn-ghost mt-3">
          <Plus className="h-4 w-4" />
          Compte
        </button>
      </section>
    </div>
  );
}
