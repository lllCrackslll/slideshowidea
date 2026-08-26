export type GenreId = "motivation" | "conseil";

export type FormatId = "story" | "short";

export type Slide = {
  id: string;
  slideNumber?: number;
  title?: string;
  text: string;
  visual: string;
};

export type Carousel = {
  id: string;
  genre: GenreId;
  topic: string;
  slides: Slide[];
  caption: string;
  hashtags: string[];
};

export type Format = {
  id: FormatId;
  emoji: string;
  label: string;
};

export type Genre = {
  id: GenreId;
  emoji: string;
  label: string;
};
