export type WorkflowStep =
  | "sourcing"
  | "editor"
  | "clean"
  | "schedule"
  | "analytics";

export type SlideFont = "tiktok" | "system";

export type SlideTextStyle = {
  fontFamily: SlideFont;
  fontSize: number;
  color: string;
  x: number;
  y: number;
};

export type CampaignSlide = {
  id: string;
  order: number;
  imageUrl: string;
  text: string;
  textStyle: SlideTextStyle;
};

export type CampaignStatus = "draft" | "ready" | "scheduled" | "published";

export type Campaign = {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  sourceLabel?: string;
  slides: CampaignSlide[];
  caption: string;
  hashtags: string[];
  status: CampaignStatus;
  cleanedAt?: string;
};

export type TikTokAccount = {
  id: string;
  label: string;
  persona: string;
  storeUrl: string;
  promoCode: string;
  publishHour: number;
  publishMinute: number;
  status: "connected" | "disconnected";
};

export type Workspace = {
  id: string;
  name: string;
  niche: string;
  handle: string;
  createdAt: string;
};

export type ScheduledPost = {
  id: string;
  campaignId: string;
  accountId: string;
  scheduledAt: string;
  status: "queued" | "simulated" | "published";
};

export type AccountMetrics = {
  accountId: string;
  views: number;
  likes: number;
  engagementRate: number;
  promoUses: number;
};

export const DEFAULT_TEXT_STYLE: SlideTextStyle = {
  fontFamily: "tiktok",
  fontSize: 52,
  color: "#ffffff",
  x: 50,
  y: 42,
};

export const WORKFLOW_STEPS: {
  id: WorkflowStep;
  label: string;
  short: string;
}[] = [
  { id: "sourcing", label: "Import", short: "1" },
  { id: "editor", label: "Éditer", short: "2" },
  { id: "clean", label: "Clean", short: "3" },
  { id: "schedule", label: "Publier", short: "4" },
  { id: "analytics", label: "Stats", short: "5" },
];
