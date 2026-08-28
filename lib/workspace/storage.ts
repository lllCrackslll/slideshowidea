import {
  DEFAULT_TEXT_STYLE,
  type Campaign,
  type CampaignSlide,
  type ScheduledPost,
  type TikTokAccount,
  type Workspace,
} from "./types";

const WORKSPACES_KEY = "carrousels-workspaces-v2";
const ACTIVE_WS_KEY = "carrousels-active-workspace-v2";
const ACTIVE_CAMPAIGN_KEY = "carrousels-active-campaign-v2";
const WORKFLOW_STEP_KEY = "carrousels-workflow-step";

function wsAccountsKey(workspaceId: string) {
  return `carrousels-accounts-${workspaceId}`;
}

function wsCampaignsKey(workspaceId: string) {
  return `carrousels-campaigns-${workspaceId}`;
}

function wsScheduleKey(workspaceId: string) {
  return `carrousels-schedule-${workspaceId}`;
}

function wsMetricsKey(workspaceId: string) {
  return `carrousels-metrics-${workspaceId}`;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultAccounts(): TikTokAccount[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `acc-${i}`,
    label: `@compte-${String(i + 1).padStart(2, "0")}`,
    persona: i === 0 ? "Grand frère bienveillant" : i === 1 ? "Pote direct" : "Coach pragmatique",
    storeUrl: "",
    promoCode: "",
    publishHour: 8 + i * 2,
    publishMinute: 15 * i,
    status: "disconnected" as const,
  }));
}

function emptySlides(): CampaignSlide[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `slide-${i}`,
    order: i + 1,
    imageUrl: "",
    text: "",
    textStyle: { ...DEFAULT_TEXT_STYLE },
  }));
}

export function createDefaultWorkspace(): Workspace {
  return {
    id: uid("ws"),
    name: "Mon app",
    niche: "Productivité",
    handle: "@monapp",
    createdAt: new Date().toISOString(),
  };
}

export function createDefaultCampaign(workspaceId: string, name = "Campagne 1"): Campaign {
  const now = new Date().toISOString();
  return {
    id: uid("camp"),
    workspaceId,
    name,
    createdAt: now,
    updatedAt: now,
    slides: emptySlides(),
    caption: "",
    hashtags: [],
    status: "draft",
  };
}

export function loadWorkspaces(): Workspace[] {
  const list = readJson<Workspace[]>(WORKSPACES_KEY, []);
  if (list.length) return list;
  const ws = createDefaultWorkspace();
  writeJson(WORKSPACES_KEY, [ws]);
  writeJson(wsAccountsKey(ws.id), defaultAccounts());
  const camp = createDefaultCampaign(ws.id);
  writeJson(wsCampaignsKey(ws.id), [camp]);
  writeJson(ACTIVE_WS_KEY, ws.id);
  writeJson(ACTIVE_CAMPAIGN_KEY, camp.id);
  return [ws];
}

export function saveWorkspaces(workspaces: Workspace[]): void {
  writeJson(WORKSPACES_KEY, workspaces);
}

export function getActiveWorkspaceId(): string | null {
  return readJson<string | null>(ACTIVE_WS_KEY, null);
}

export function setActiveWorkspaceId(id: string): void {
  writeJson(ACTIVE_WS_KEY, id);
}

export function getActiveCampaignId(): string | null {
  return readJson<string | null>(ACTIVE_CAMPAIGN_KEY, null);
}

export function setActiveCampaignId(id: string): void {
  writeJson(ACTIVE_CAMPAIGN_KEY, id);
}

export function loadCampaigns(workspaceId: string): Campaign[] {
  return readJson<Campaign[]>(wsCampaignsKey(workspaceId), []);
}

export function saveCampaigns(workspaceId: string, campaigns: Campaign[]): void {
  writeJson(wsCampaignsKey(workspaceId), campaigns);
}

export function upsertCampaign(workspaceId: string, campaign: Campaign): Campaign {
  const list = loadCampaigns(workspaceId);
  const idx = list.findIndex((c) => c.id === campaign.id);
  const next = { ...campaign, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  saveCampaigns(workspaceId, list);
  return next;
}

export function loadAccounts(workspaceId: string): TikTokAccount[] {
  const accounts = readJson<TikTokAccount[]>(wsAccountsKey(workspaceId), []);
  return accounts.length ? accounts : defaultAccounts();
}

export function saveAccounts(workspaceId: string, accounts: TikTokAccount[]): void {
  writeJson(wsAccountsKey(workspaceId), accounts);
}

export function loadSchedule(workspaceId: string): ScheduledPost[] {
  return readJson<ScheduledPost[]>(wsScheduleKey(workspaceId), []);
}

export function saveSchedule(workspaceId: string, posts: ScheduledPost[]): void {
  writeJson(wsScheduleKey(workspaceId), posts);
}

export function loadMetrics(workspaceId: string): Record<string, { views: number; likes: number; engagementRate: number; promoUses: number }> {
  return readJson(wsMetricsKey(workspaceId), {});
}

export function bumpMetrics(workspaceId: string, accountId: string): void {
  const all = loadMetrics(workspaceId);
  const cur = all[accountId] ?? { views: 0, likes: 0, engagementRate: 0, promoUses: 0 };
  all[accountId] = {
    views: cur.views + Math.floor(800 + Math.random() * 4200),
    likes: cur.likes + Math.floor(40 + Math.random() * 180),
    engagementRate: Number((3.5 + Math.random() * 4).toFixed(1)),
    promoUses: cur.promoUses + (Math.random() > 0.6 ? 1 : 0),
  };
  writeJson(wsMetricsKey(workspaceId), all);
}

export function getWorkflowStep(): import("./types").WorkflowStep {
  const step = readJson<string>(WORKFLOW_STEP_KEY, "sourcing");
  const valid = ["sourcing", "editor", "clean", "schedule", "analytics"];
  return (valid.includes(step) ? step : "sourcing") as import("./types").WorkflowStep;
}

export function setWorkflowStep(step: import("./types").WorkflowStep): void {
  writeJson(WORKFLOW_STEP_KEY, step);
}
