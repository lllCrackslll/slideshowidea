export type NamedAccount = {
  index: number;
  name: string;
};

export type PublishSlot = {
  id: string;
  accountIndex: number;
  accountLabel: string;
  conceptLabel: string;
  time: string;
  sortKey: number;
};

export type PackHistoryEntry = {
  id: string;
  createdAt: string;
  label: string;
  accountCount: number;
  conceptCount: number;
  packType: "single" | "daily";
};

export type BrollCategory = "hook" | "content" | "app" | "cta";

export const BROLL_CATEGORY_LABELS: Record<BrollCategory, string> = {
  hook: "Hook (slide 1)",
  content: "Contenu (slides 2–3)",
  app: "App (slide 4)",
  cta: "CTA (slide 5)",
};
