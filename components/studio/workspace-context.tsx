"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createDefaultCampaign,
  createDefaultWorkspace,
  deleteWorkspace as removeWorkspace,
  ensureWorkspaceCampaign,
  getActiveCampaignId,
  getActiveWorkspaceId,
  getWorkflowStep,
  purgeLegacyCampaignBlobs,
  loadAccounts,
  loadCampaignsHydrated,
  loadWorkspaces,
  saveAccounts,
  saveWorkspaces,
  setActiveCampaignId,
  setActiveWorkspaceId,
  setWorkflowStep,
  upsertCampaign,
} from "@/lib/workspace/storage";
import type {
  Campaign,
  TikTokAccount,
  WorkflowStep,
  Workspace,
} from "@/lib/workspace/types";

function resolveActiveWorkspaceId(wsList: Workspace[]): string | null {
  const stored = getActiveWorkspaceId();
  if (stored && wsList.some((w) => w.id === stored)) return stored;
  return wsList[0]?.id ?? null;
}

type WorkspaceContextValue = {
  ready: boolean;
  workspaces: Workspace[];
  workspace: Workspace | null;
  campaign: Campaign | null;
  accounts: TikTokAccount[];
  step: WorkflowStep;
  setStep: (step: WorkflowStep) => void;
  /** Choisir une campagne (= app). */
  selectApp: (id: string) => void;
  addApp: (name: string) => void;
  updateApp: (partial: Partial<Workspace>) => void;
  deleteApp: (id: string) => void;
  updateCampaign: (campaign: Campaign) => Promise<void>;
  updateAccounts: (accounts: TikTokAccount[]) => void;
  /** Campagne active + au moins un compte TikTok. */
  studioReady: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [step, setStepState] = useState<WorkflowStep>("sourcing");

  const loadApp = useCallback(async (id: string) => {
    const camps = await loadCampaignsHydrated(id);
    const camp = camps.find((c) => c.id === id) ?? camps[0] ?? null;
    setCampaign(camp);
    if (camp) {
      setActiveCampaignId(camp.id);
    }
  }, []);

  useEffect(() => {
    async function boot() {
      const wsList = loadWorkspaces();
      const activeWs = resolveActiveWorkspaceId(wsList);
      if (activeWs) purgeLegacyCampaignBlobs(activeWs);

      setWorkspaces(wsList);
      setWorkspaceId(activeWs);
      if (activeWs) {
        setAccounts(loadAccounts(activeWs));
        await loadApp(activeWs);
      } else {
        setCampaign(null);
        setAccounts([]);
      }
      setStepState(getWorkflowStep());
      setReady(true);
    }
    void boot();
  }, [loadApp]);

  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );

  const studioReady = useMemo(
    () => Boolean(workspace && campaign && accounts.length > 0),
    [workspace, campaign, accounts.length],
  );

  const setStep = useCallback((next: WorkflowStep) => {
    setStepState(next);
    setWorkflowStep(next);
  }, []);

  const selectApp = useCallback(
    (id: string) => {
      setActiveWorkspaceId(id);
      setWorkspaceId(id);
      setAccounts(loadAccounts(id));
      void loadApp(id);
    },
    [loadApp],
  );

  const addApp = useCallback(
    (name: string) => {
      const ws = createDefaultWorkspace();
      ws.name = name.trim() || "Nouvelle campagne";
      ws.handle = "@monapp";

      const next = [...workspaces, ws];
      saveWorkspaces(next);
      setWorkspaces(next);
      saveAccounts(ws.id, []);

      const camp = createDefaultCampaign(ws.id, ws.name);
      void upsertCampaign(ws.id, camp).then(() => {
        selectApp(ws.id);
      });
    },
    [workspaces, selectApp],
  );

  const updateApp = useCallback(
    (partial: Partial<Workspace>) => {
      if (!workspace) return;
      const nextWs = { ...workspace, ...partial };
      const nextList = workspaces.map((w) => (w.id === workspace.id ? nextWs : w));
      saveWorkspaces(nextList);
      setWorkspaces(nextList);

      if (partial.name && campaign) {
        void upsertCampaign(workspace.id, { ...campaign, name: partial.name }).then((saved) => {
          setCampaign(saved);
        });
      }
    },
    [workspace, workspaces, campaign],
  );

  const deleteApp = useCallback(
    (id: string) => {
      removeWorkspace(id);
      const wsList = loadWorkspaces();
      setWorkspaces(wsList);
      const activeWs = resolveActiveWorkspaceId(wsList);
      setWorkspaceId(activeWs);
      if (activeWs) {
        setAccounts(loadAccounts(activeWs));
        void loadApp(activeWs);
      } else {
        setCampaign(null);
        setAccounts([]);
      }
    },
    [loadApp],
  );

  const updateCampaign = useCallback(
    async (updated: Campaign) => {
      if (!workspaceId) return;
      try {
        const saved = await upsertCampaign(workspaceId, updated);
        setCampaign(saved);
      } catch (error) {
        console.error("[workspace] save campaign", error);
        throw error;
      }
    },
    [workspaceId],
  );

  const updateAccounts = useCallback(
    (next: TikTokAccount[]) => {
      if (!workspaceId) return;
      saveAccounts(workspaceId, next);
      setAccounts(next);
    },
    [workspaceId],
  );

  const value: WorkspaceContextValue = {
    ready,
    workspaces,
    workspace,
    campaign,
    accounts,
    step,
    setStep,
    selectApp,
    addApp,
    updateApp,
    deleteApp,
    updateCampaign,
    updateAccounts,
    studioReady,
  };

  return (
    <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
