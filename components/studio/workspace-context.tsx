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
  getActiveCampaignId,
  getActiveWorkspaceId,
  getWorkflowStep,
  loadAccounts,
  loadCampaigns,
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
  addCampaign: (name: string) => void;
  updateCampaign: (campaign: Campaign) => void;
  updateAccounts: (accounts: TikTokAccount[]) => void;
  updateWorkspace: (partial: Partial<Workspace>) => void;
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
    const wsList = loadWorkspaces();
    const activeWs = getActiveWorkspaceId() ?? wsList[0]?.id ?? null;
    const camps = activeWs ? loadCampaigns(activeWs) : [];
    const activeCamp = getActiveCampaignId() ?? camps[0]?.id ?? null;

    setWorkspaces(wsList);
    setWorkspaceId(activeWs);
    setCampaigns(camps);
    setCampaignId(activeCamp);
    if (activeWs) setAccounts(loadAccounts(activeWs));
    setStepState(getWorkflowStep());
    setReady(true);
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
    const camps = loadCampaigns(id);
    setCampaigns(camps);
    const first = camps[0]?.id ?? null;
    if (first) {
      setActiveCampaignId(first);
      setCampaignId(first);
    }
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
      selectWorkspace(ws.id);
      const camp = createDefaultCampaign(ws.id);
      upsertCampaign(ws.id, camp);
      setCampaigns([camp]);
      setCampaignId(camp.id);
      setActiveCampaignId(camp.id);
    },
    [workspaces, selectWorkspace],
  );

  const addCampaign = useCallback(
    (name: string) => {
      if (!workspaceId) return;
      const camp = createDefaultCampaign(workspaceId, name.trim() || "Nouvelle campagne");
      upsertCampaign(workspaceId, camp);
      const camps = loadCampaigns(workspaceId);
      setCampaigns(camps);
      selectCampaign(camp.id);
    },
    [workspaceId, selectCampaign],
  );

  const updateCampaign = useCallback(
    (updated: Campaign) => {
      if (!workspaceId) return;
      const saved = upsertCampaign(workspaceId, updated);
      setCampaigns(loadCampaigns(workspaceId));
      setCampaignId(saved.id);
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
