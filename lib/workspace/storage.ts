import {
  hydrateCampaignImages,
  isDataImageUrl,
  stripCampaignImages,
} from "./image-store";
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" || error.code === 22)
    ) {
      throw new Error(
        "Stockage navigateur plein — supprime une campagne ou vide le cache.",
      );
    }
    throw error;
  }
}

export function loadAccounts(workspaceId: string): TikTokAccount[] {
  return readJson<TikTokAccount[]>(wsAccountsKey(workspaceId), []);
}

function emptySlides(): CampaignSlide[] {
  return Array.from({ length: 10 }, (_, i) => ({
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

export function createCleanSlots(): CampaignSlide[] {
  return emptySlides();
}

export function createDefaultCampaign(workspaceId: string, name = "Campagne 1"): Campaign {
  const now = new Date().toISOString();
  return {
    id: workspaceId,
    workspaceId,
    name,
    createdAt: now,
    updatedAt: now,
    slides: emptySlides(),
    caption: "",
    hashtags: [],
    status: "draft",
    accountMedia: {},
    accountVideos: {},
    publishFormat: "carousel",
  };
}

/** 1 app = 1 campagne (même id). */
export function ensureWorkspaceCampaign(workspace: Workspace): Campaign {
  const list = loadCampaigns(workspace.id);
  const primary = list.find((c) => c.id === workspace.id) ?? list[0];

  if (!primary) {
    const created = createDefaultCampaign(workspace.id, workspace.name);
    saveCampaigns(workspace.id, [created]);
    return created;
  }

  const synced: Campaign = {
    ...primary,
    id: workspace.id,
    workspaceId: workspace.id,
    name: workspace.name,
  };
  saveCampaigns(workspace.id, [synced]);
  return synced;
}

export function ensureAllWorkspaceCampaigns(workspaces: Workspace[]): void {
  for (const ws of workspaces) {
    ensureWorkspaceCampaign(ws);
  }
}

export function loadWorkspaces(): Workspace[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(WORKSPACES_KEY);
  if (raw === null) {
    const ws = createDefaultWorkspace();
    writeJson(WORKSPACES_KEY, [ws]);
    writeJson(wsAccountsKey(ws.id), []);
    const camp = createDefaultCampaign(ws.id, ws.name);
    writeJson(wsCampaignsKey(ws.id), [camp]);
    writeJson(ACTIVE_WS_KEY, ws.id);
    writeJson(ACTIVE_CAMPAIGN_KEY, camp.id);
    return [ws];
  }

  try {
    const list = JSON.parse(raw) as Workspace[];
    if (list.length) ensureAllWorkspaceCampaigns(list);
    return list;
  } catch {
    return [];
  }
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

export async function loadCampaignsHydrated(workspaceId: string): Promise<Campaign[]> {
  const list = loadCampaigns(workspaceId);
  return Promise.all(list.map((c) => hydrateCampaignImages(c)));
}

export function saveCampaigns(workspaceId: string, campaigns: Campaign[]): void {
  writeJson(wsCampaignsKey(workspaceId), campaigns);
}

/** Retire les data URLs éventuelles restantes (migration campagnes anciennes). */
function compactCampaignForJson(campaign: Campaign): Campaign {
  const stripUrl = (url: string) => (isDataImageUrl(url) ? "" : url);
  const accountMedia: Record<string, string[]> = {};
  if (campaign.accountMedia) {
    for (const [id, urls] of Object.entries(campaign.accountMedia)) {
      accountMedia[id] = urls.map(stripUrl);
    }
  }
  const accountVideos: Record<string, string[]> = {};
  if (campaign.accountVideos) {
    for (const [id, urls] of Object.entries(campaign.accountVideos)) {
      accountVideos[id] = urls.map(stripUrl);
    }
  }
  return {
    ...campaign,
    importedImages: campaign.importedImages?.map(stripUrl),
    accountMedia,
    accountVideos,
    slides: campaign.slides.map((slide) => ({
      ...slide,
      imageUrl: stripUrl(slide.imageUrl),
    })),
  };
}

/** Purge les vieilles data URLs qui saturaient localStorage. */
export function purgeLegacyCampaignBlobs(workspaceId: string): void {
  const list = loadCampaigns(workspaceId);
  let dirty = false;
  const next = list.map((campaign) => {
    const compacted = compactCampaignForJson(campaign);
    if (JSON.stringify(compacted) !== JSON.stringify(campaign)) dirty = true;
    return compacted;
  });
  if (dirty) {
    try {
      saveCampaigns(workspaceId, next);
    } catch {
      /* quota déjà plein — l'utilisateur devra vider manuellement */
    }
  }
}

export function deleteCampaign(workspaceId: string, campaignId: string): void {
  const list = loadCampaigns(workspaceId).filter((c) => c.id !== campaignId);
  saveCampaigns(workspaceId, list);
  const active = getActiveCampaignId();
  if (active === campaignId) {
    const next = list[0]?.id ?? null;
    if (next) setActiveCampaignId(next);
    else localStorage.removeItem(ACTIVE_CAMPAIGN_KEY);
  }
}

export function deleteWorkspace(workspaceId: string): void {
  const list = loadWorkspaces().filter((w) => w.id !== workspaceId);
  saveWorkspaces(list);
  localStorage.removeItem(wsAccountsKey(workspaceId));
  localStorage.removeItem(wsCampaignsKey(workspaceId));
  localStorage.removeItem(wsScheduleKey(workspaceId));
  localStorage.removeItem(wsMetricsKey(workspaceId));
  const active = getActiveWorkspaceId();
  if (active === workspaceId) {
    if (list[0]) {
      setActiveWorkspaceId(list[0].id);
    } else {
      localStorage.removeItem(ACTIVE_WS_KEY);
      localStorage.removeItem(ACTIVE_CAMPAIGN_KEY);
    }
  }
}

export async function upsertCampaign(
  workspaceId: string,
  campaign: Campaign,
): Promise<Campaign> {
  const stripped = await stripCampaignImages(campaign);
  const forJson = compactCampaignForJson(stripped);
  const list = loadCampaigns(workspaceId);
  const idx = list.findIndex((c) => c.id === campaign.id);
  const meta = { ...forJson, updatedAt: new Date().toISOString() };
  if (idx >= 0) list[idx] = meta;
  else list.unshift(meta);
  saveCampaigns(workspaceId, list);
  return { ...campaign, updatedAt: meta.updatedAt };
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

export function removeScheduledPost(
  workspaceId: string,
  postId: string,
): ScheduledPost[] {
  const next = loadSchedule(workspaceId).filter((post) => post.id !== postId);
  saveSchedule(workspaceId, next);
  return next;
}

export function clearCampaignSchedule(
  workspaceId: string,
  campaignId: string,
): ScheduledPost[] {
  const next = loadSchedule(workspaceId).filter((post) => post.campaignId !== campaignId);
  saveSchedule(workspaceId, next);
  return next;
}

export function getWorkflowStep(): import("./types").WorkflowStep {
  const step = readJson<string>(WORKFLOW_STEP_KEY, "sourcing");
  if (step === "editor") return "clean";
  const valid = ["sourcing", "clean", "schedule", "analytics"];
  return (valid.includes(step) ? step : "sourcing") as import("./types").WorkflowStep;
}

export function setWorkflowStep(step: import("./types").WorkflowStep): void {
  writeJson(WORKFLOW_STEP_KEY, step);
}
