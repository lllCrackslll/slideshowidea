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
  getActiveWorkspaceId,
  getWorkflowStep,
  loadCampaignsHydrated,
  loadWorkspaces,
  purgeLegacyCampaignBlobs,
  saveWorkspaces,
  setActiveCampaignId,
  setActiveWorkspaceId,
  setWorkflowStep,
  upsertCampaign,
} from "@/lib/workspace/storage";
import type { Campaign, WorkflowStep, Workspace } from "@/lib/workspace/types";

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
  step: WorkflowStep;
  setStep: (step: WorkflowStep) => void;
  selectApp: (id: string) => void;
  addApp: (name: string) => void;
  updateApp: (partial: Partial<Workspace>) => void;
  deleteApp: (id: string) => void;
  updateCampaign: (campaign: Campaign) => Promise<void>;
  studioReady: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [step, setStepState] = useState<WorkflowStep>("sourcing");

  const loadApp = useCallback(async (id: string) => {
    const camps = await loadCampaignsHydrated(id);
    const camp = camps.find((c) => c.id === id) ?? camps[0] ?? null;
    setCampaign(camp);
    if (camp) setActiveCampaignId(camp.id);
  }, []);

  useEffect(() => {
    async function boot() {
      let wsList = loadWorkspaces();
      if (!wsList.length) {
        const ws = createDefaultWorkspace();
        wsList = [ws];
        saveWorkspaces(wsList);
        await upsertCampaign(ws.id, createDefaultCampaign(ws.id, ws.name));
      }

      const activeWs = resolveActiveWorkspaceId(wsList);
      if (activeWs) purgeLegacyCampaignBlobs(activeWs);

      setWorkspaces(wsList);
      setWorkspaceId(activeWs);
      if (activeWs) await loadApp(activeWs);
      else setCampaign(null);

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
    () => Boolean(workspace && campaign),
    [workspace, campaign],
  );

  const setStep = useCallback((next: WorkflowStep) => {
    setStepState(next);
    setWorkflowStep(next);
  }, []);

  const selectApp = useCallback(
    (id: string) => {
      setActiveWorkspaceId(id);
      setWorkspaceId(id);
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

      void upsertCampaign(ws.id, createDefaultCampaign(ws.id, ws.name)).then(() => {
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
      if (activeWs) void loadApp(activeWs);
      else setCampaign(null);
    },
    [loadApp],
  );

  const updateCampaign = useCallback(
    async (updated: Campaign) => {
      if (!workspaceId) return;
      const saved = await upsertCampaign(workspaceId, updated);
      setCampaign(saved);
    },
    [workspaceId],
  );

  const value: WorkspaceContextValue = {
    ready,
    workspaces,
    workspace,
    campaign,
    step,
    setStep,
    selectApp,
    addApp,
    updateApp,
    deleteApp,
    updateCampaign,
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
