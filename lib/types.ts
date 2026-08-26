export type GenreId =
  | "neuroscience"
  | "debunking"
  | "routines"
  | "tech";

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

export type Genre = {
  id: GenreId;
  emoji: string;
  label: string;
};
