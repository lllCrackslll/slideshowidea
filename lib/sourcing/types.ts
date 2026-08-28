export type ImportedSlide = {
  imageUrl: string;
  text: string;
};

export type TikTokImportResult = {
  title: string;
  author: string;
  caption: string;
  hashtags: string[];
  slides: ImportedSlide[];
  sourceUrl: string;
  partial?: boolean;
  hint?: string;
};

export type TikTokImportRequest = {
  url: string;
};
