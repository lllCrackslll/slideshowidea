import type { Campaign, PublishFormat } from "./types";

export function getCampaignMedia(campaign: Campaign, format: PublishFormat): string[] {
  if (format === "video") {
    if (campaign.mediaVideos?.length) return campaign.mediaVideos;
    if (campaign.accountVideos) {
      return Object.values(campaign.accountVideos).flat();
    }
    return [];
  }

  if (campaign.mediaUrls?.length) return campaign.mediaUrls;
  if (campaign.accountMedia) {
    return Object.values(campaign.accountMedia).flat();
  }
  return [];
}

export function setCampaignMedia(
  campaign: Campaign,
  urls: string[],
  format: PublishFormat,
): Campaign {
  if (format === "video") {
    return {
      ...campaign,
      mediaVideos: urls,
      accountVideos: undefined,
    };
  }
  return {
    ...campaign,
    mediaUrls: urls,
    accountMedia: undefined,
  };
}
