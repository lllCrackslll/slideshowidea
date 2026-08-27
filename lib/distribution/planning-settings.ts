export type PlanningSettings = {
  accountCount: number;
  postsPerDay: number;
  startHour: number;
  startMinute: number;
  intervalMinutes: number;
};

export const DEFAULT_PLANNING_SETTINGS: PlanningSettings = {
  accountCount: 10,
  postsPerDay: 3,
  startHour: 8,
  startMinute: 0,
  intervalMinutes: 25,
};

const STORAGE_KEY = "carrousels-planning-settings";

export function loadPlanningSettings(): PlanningSettings {
  if (typeof window === "undefined") return DEFAULT_PLANNING_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PLANNING_SETTINGS;
    return { ...DEFAULT_PLANNING_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLANNING_SETTINGS;
  }
}

export function savePlanningSettings(
  partial: Partial<PlanningSettings>,
): PlanningSettings {
  const next = { ...loadPlanningSettings(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
