"use client";

import { Link2, Pencil, Plus, Trash2, Unlink } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWorkspace } from "@/components/studio/workspace-context";
import type { TikTokAccount, Workspace } from "@/lib/workspace/types";

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
    accounts,
    selectApp,
    addApp,
    updateApp,
    deleteApp,
    updateAccounts,
  } = useWorkspace();

  const [newName, setNewName] = useState("");
  const [editApp, setEditApp] = useState<Workspace | null>(null);
  const [editAcc, setEditAcc] = useState<TikTokAccount | null>(null);
  const [oauthMsg, setOauthMsg] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;

  const syncTikTokConnections = useCallback(async () => {
    if (!workspace) return;
    try {
      const res = await fetch(
        `/api/tiktok/connections?workspaceId=${encodeURIComponent(workspace.id)}`,
      );
      if (!res.ok) return;
      const payload = (await res.json()) as {
        connections: Array<{
          accountId: string;
          displayName?: string;
        }>;
      };
      const linkedIds = new Set(payload.connections.map((item) => item.accountId));
      const displayNames = new Map(
        payload.connections.map((item) => [item.accountId, item.displayName]),
      );

      updateAccounts(
        accountsRef.current.map((acc) => {
          if (!linkedIds.has(acc.id)) {
            return acc.status === "connected"
              ? { ...acc, status: "disconnected" as const }
              : acc;
          }
          const displayName = displayNames.get(acc.id);
          return {
            ...acc,
            status: "connected" as const,
            label: displayName
              ? displayName.startsWith("@")
                ? displayName
                : `@${displayName}`
              : acc.label,
          };
        }),
      );
    } catch {
      /* API indisponible côté dev sans env */
    }
  }, [workspace, updateAccounts]);

  useEffect(() => {
    void syncTikTokConnections();
  }, [workspace?.id, syncTikTokConnections]);

  useEffect(() => {
    const status = searchParams.get("tiktok");
    if (status === "connected") {
      void syncTikTokConnections();
      setOauthMsg("Compte TikTok connecté.");
      window.history.replaceState({}, "", "/setup");
    } else if (status === "error") {
      setOauthMsg("Connexion TikTok échouée. Vérifie la config API.");
      window.history.replaceState({}, "", "/setup");
    }
  }, [searchParams, syncTikTokConnections]);

  async function disconnectTikTok(accountId: string) {
    if (!workspace) return;
    await fetch("/api/tiktok/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: workspace.id, accountId }),
    });
    updateAccounts(
      accounts.map((acc) =>
        acc.id === accountId ? { ...acc, status: "disconnected" as const } : acc,
      ),
    );
    setOauthMsg("Compte TikTok déconnecté.");
  }

  if (!ready) {
    return <div className="k-page py-20 text-center text-sm k-text-muted">…</div>;
  }

  function saveApp() {
    if (!editApp) return;
    updateApp({ name: editApp.name, handle: editApp.handle, niche: editApp.niche });
    setEditApp(null);
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
        <p className="mt-1 text-sm k-text-muted">
          1 campagne = 1 app · comptes TikTok par campagne
        </p>
      </header>

      <section className="k-card">
        <h2 className="k-subheading">Campagnes</h2>
        <ul className="mt-4 space-y-2">
          {workspaces.length === 0 ? (
            <li className="k-row py-3 text-sm k-text-muted">Aucune campagne.</li>
          ) : null}
          {workspaces.map((ws) => (
            <li key={ws.id} className="k-row flex flex-wrap items-center gap-3">
              {editApp?.id === ws.id ? (
                <>
                  <input
                    value={editApp.name}
                    onChange={(e) => setEditApp({ ...editApp, name: e.target.value })}
                    className="k-input h-9 flex-1 min-w-[120px]"
                    placeholder="Nom campagne / app"
                  />
                  <input
                    value={editApp.handle}
                    onChange={(e) => setEditApp({ ...editApp, handle: e.target.value })}
                    className="k-input h-9 flex-1 min-w-[100px]"
                    placeholder="@handle"
                  />
                  <RowActions
                    editing
                    onSave={saveApp}
                    onCancel={() => setEditApp(null)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => selectApp(ws.id)}
                    className={`flex-1 text-left text-sm font-medium ${workspace?.id === ws.id ? "k-accent" : "k-text"}`}
                  >
                    {ws.name}
                    <span className="ml-2 text-xs k-text-muted">{ws.handle}</span>
                  </button>
                  <RowActions
                    editing={false}
                    onEdit={() => setEditApp({ ...ws })}
                    onDelete={() => {
                      if (confirm(`Supprimer « ${ws.name} » ?`)) deleteApp(ws.id);
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
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nouvelle campagne"
            className="k-input h-10 flex-1"
          />
          <button
            type="button"
            onClick={() => {
              if (newName.trim()) addApp(newName.trim());
              setNewName("");
            }}
            className="k-btn-secondary h-10 px-3"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      {workspace ? (
      <section className="k-card">
        <h2 className="k-subheading">Comptes TikTok</h2>
        <p className="mt-1 text-xs k-text-muted">
          {workspace.name} · {accounts.length} compte{accounts.length > 1 ? "s" : ""}
        </p>
        {oauthMsg ? <p className="mt-2 text-xs k-accent">{oauthMsg}</p> : null}
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
                    <p className="mt-0.5 text-xs k-text-muted">
                      {acc.status === "connected" ? "TikTok connecté" : "Non connecté"}
                    </p>
                    {acc.promoCode ? (
                      <p className="mt-0.5 text-xs k-text-muted">Code: {acc.promoCode}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {acc.status === "connected" ? (
                      <button
                        type="button"
                        onClick={() => void disconnectTikTok(acc.id)}
                        className="k-btn-ghost h-9 px-2 text-xs"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                        Déconnecter
                      </button>
                    ) : (
                      <a
                        href={`/api/tiktok/auth?workspaceId=${encodeURIComponent(workspace.id)}&accountId=${encodeURIComponent(acc.id)}`}
                        className="k-btn-secondary h-9 px-2 text-xs"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Connecter TikTok
                      </a>
                    )}
                    <RowActions
                    editing={false}
                    onEdit={() => setEditAcc({ ...acc })}
                    onDelete={() => {
                      if (confirm(`Supprimer ${acc.label} ?`)) {
                        updateAccounts(accounts.filter((a) => a.id !== acc.id));
                      }
                    }}
                    onSave={() => {}}
                    onCancel={() => {}}
                  />
                  </div>
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
      ) : null}
    </div>
  );
}
