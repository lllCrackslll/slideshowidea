export type AppProfile = {
  appName: string;
  handle: string;
  niche: string;
  audience: string;
  features: string;
};

export const DEFAULT_APP_PROFILE: AppProfile = {
  appName: "Mon app",
  handle: "@monapp",
  niche: "app mobile utile au quotidien",
  audience: "utilisateurs francophones 18–35 ans",
  features:
    "fonctionnalité principale à mettre en avant (ex. suivi, productivité, bien-être)",
};

const STORAGE_KEY = "carrousels-app-profile";

export function loadAppProfile(): AppProfile {
  if (typeof window === "undefined") return DEFAULT_APP_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APP_PROFILE;
    return { ...DEFAULT_APP_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APP_PROFILE;
  }
}

export function saveAppProfile(partial: Partial<AppProfile>): AppProfile {
  const next = { ...loadAppProfile(), ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function appProfileComplete(profile: AppProfile): boolean {
  return (
    profile.appName.trim().length > 1 &&
    profile.handle.trim().startsWith("@") &&
    profile.niche.trim().length > 3
  );
}
