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
  deleteCampaign as removeCampaign,
  deleteWorkspace as removeWorkspace,
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

type WorkspaceContextValue = {
  ready: boolean;
  workspaces: Workspace[];
  workspace: Workspace | null;
  campaigns: Campaign[];
  campaign: Campaign | null;
  accounts: TikTokAccount[];
  step: WorkflowStep;
  setStep: (step: WorkflowStep) => void;
  selectWorkspace: (id: string) => void;
  selectCampaign: (id: string) => void;
  addWorkspace: (name: string) => void;
  addCampaign: (name: string) => Promise<void>;
  updateCampaign: (campaign: Campaign) => Promise<void>;
  updateAccounts: (accounts: TikTokAccount[]) => void;
  updateWorkspace: (partial: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  deleteCampaign: (id: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<TikTokAccount[]>([]);
  const [step, setStepState] = useState<WorkflowStep>("sourcing");

  useEffect(() => {
    async function boot() {
      const wsList = loadWorkspaces();
      const activeWs = getActiveWorkspaceId() ?? wsList[0]?.id ?? null;
      if (activeWs) purgeLegacyCampaignBlobs(activeWs);
      const camps = activeWs ? await loadCampaignsHydrated(activeWs) : [];
      const activeCamp = getActiveCampaignId() ?? camps[0]?.id ?? null;

      setWorkspaces(wsList);
      setWorkspaceId(activeWs);
      setCampaigns(camps);
      setCampaignId(activeCamp);
      if (activeWs) setAccounts(loadAccounts(activeWs));
      setStepState(getWorkflowStep());
      setReady(true);
    }
    void boot();
  }, []);

  const workspace = useMemo(
    () => workspaces.find((w) => w.id === workspaceId) ?? null,
    [workspaces, workspaceId],
  );

  const campaign = useMemo(
    () => campaigns.find((c) => c.id === campaignId) ?? null,
    [campaigns, campaignId],
  );

  const setStep = useCallback((next: WorkflowStep) => {
    setStepState(next);
    setWorkflowStep(next);
  }, []);

  const selectWorkspace = useCallback((id: string) => {
    setActiveWorkspaceId(id);
    setWorkspaceId(id);
    void loadCampaignsHydrated(id).then((camps) => {
      setCampaigns(camps);
      const first = camps[0]?.id ?? null;
      if (first) {
        setActiveCampaignId(first);
        setCampaignId(first);
      }
    });
    setAccounts(loadAccounts(id));
  }, []);

  const selectCampaign = useCallback((id: string) => {
    setActiveCampaignId(id);
    setCampaignId(id);
  }, []);

  const addWorkspace = useCallback(
    (name: string) => {
      const ws: Workspace = {
        id: `ws-${Date.now()}`,
        name: name.trim() || "Nouvelle app",
        niche: "Général",
        handle: "@monapp",
        createdAt: new Date().toISOString(),
      };
      const next = [...workspaces, ws];
      saveWorkspaces(next);
      setWorkspaces(next);
      saveAccounts(ws.id, loadAccounts(ws.id));
      selectWorkspace(ws.id);
      const camp = createDefaultCampaign(ws.id);
      void upsertCampaign(ws.id, camp).then(async () => {
        setCampaigns(await loadCampaignsHydrated(ws.id));
      });
      setCampaignId(camp.id);
      setActiveCampaignId(camp.id);
    },
    [workspaces, selectWorkspace],
  );

  const addCampaign = useCallback(
    async (name: string) => {
      if (!workspaceId) return;
      const camp = createDefaultCampaign(workspaceId, name.trim() || "Nouvelle campagne");
      await upsertCampaign(workspaceId, camp);
      const camps = await loadCampaignsHydrated(workspaceId);
      setCampaigns(camps);
      selectCampaign(camp.id);
    },
    [workspaceId, selectCampaign],
  );

  const updateCampaign = useCallback(
    async (updated: Campaign) => {
      if (!workspaceId) return;
      try {
        const saved = await upsertCampaign(workspaceId, updated);
        const camps = await loadCampaignsHydrated(workspaceId);
        setCampaigns(camps);
        setCampaignId(saved.id);
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

  const deleteWorkspace = useCallback(
    (id: string) => {
      removeWorkspace(id);
      const wsList = loadWorkspaces();
      setWorkspaces(wsList);
      const activeWs = getActiveWorkspaceId() ?? wsList[0]?.id ?? null;
      setWorkspaceId(activeWs);
      if (activeWs) {
        void loadCampaignsHydrated(activeWs).then(setCampaigns);
        setAccounts(loadAccounts(activeWs));
        setCampaignId(getActiveCampaignId() ?? null);
      }
    },
    [],
  );

  const deleteCampaign = useCallback(
    (id: string) => {
      if (!workspaceId) return;
      removeCampaign(workspaceId, id);
      void loadCampaignsHydrated(workspaceId).then((camps) => {
        setCampaigns(camps);
        setCampaignId(getActiveCampaignId() ?? camps[0]?.id ?? null);
      });
    },
    [workspaceId],
  );

  const updateWorkspace = useCallback(
    (partial: Partial<Workspace>) => {
      if (!workspace) return;
      const next = workspaces.map((w) =>
        w.id === workspace.id ? { ...w, ...partial } : w,
      );
      saveWorkspaces(next);
      setWorkspaces(next);
    },
    [workspace, workspaces],
  );

  const value: WorkspaceContextValue = {
    ready,
    workspaces,
    workspace,
    campaigns,
    campaign,
    accounts,
    step,
    setStep,
    selectWorkspace,
    selectCampaign,
    addWorkspace,
    addCampaign,
    updateCampaign,
    updateAccounts,
    updateWorkspace,
    deleteWorkspace,
    deleteCampaign,
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
