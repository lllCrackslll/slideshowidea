export type TikTokCreatorInfo = {
  creatorAvatarUrl?: string;
  creatorUsername?: string;
  creatorNickname?: string;
  privacyLevelOptions: string[];
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxVideoPostDurationSec: number;
};

export type TikTokPostSettings = {
  title: string;
  privacyLevel: string;
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  commercialEnabled: boolean;
  yourBrand: boolean;
  brandedContent: boolean;
};

export const EMPTY_TIKTOK_POST_SETTINGS: TikTokPostSettings = {
  title: "",
  privacyLevel: "",
  allowComment: false,
  allowDuet: false,
  allowStitch: false,
  commercialEnabled: false,
  yourBrand: false,
  brandedContent: false,
};

const PRIVACY_LABELS: Record<string, string> = {
  PUBLIC_TO_EVERYONE: "Tout le monde",
  MUTUAL_FOLLOW_FRIENDS: "Amis",
  FOLLOWER_OF_CREATOR: "Abonnés",
  SELF_ONLY: "Moi seulement",
};

export function privacyLabel(value: string) {
  return PRIVACY_LABELS[value] ?? value;
}

export function consentText(settings: TikTokPostSettings) {
  if (settings.commercialEnabled && settings.brandedContent) {
    return "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation.";
  }
  return "By posting, you agree to TikTok's Music Usage Confirmation.";
}

export function canPublishWithSettings(settings: TikTokPostSettings, musicConsent: boolean) {
  if (!musicConsent || !settings.privacyLevel || !settings.title.trim()) return false;
  if (settings.commercialEnabled && !settings.yourBrand && !settings.brandedContent) return false;
  if (settings.commercialEnabled && settings.brandedContent && settings.privacyLevel === "SELF_ONLY") {
    return false;
  }
  return true;
}

export function parsePostSettings(raw: string | null): TikTokPostSettings | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TikTokPostSettings;
  } catch {
    return null;
  }
}

export function toApiPostInfo(settings: TikTokPostSettings, caption: string) {
  return {
    title: settings.title.trim().slice(0, 90),
    description: caption.slice(0, 4000),
    privacy_level: settings.privacyLevel,
    disable_comment: !settings.allowComment,
    disable_duet: !settings.allowDuet,
    disable_stitch: !settings.allowStitch,
    brand_organic_toggle: settings.commercialEnabled && settings.yourBrand,
    brand_content_toggle: settings.commercialEnabled && settings.brandedContent,
  };
}
