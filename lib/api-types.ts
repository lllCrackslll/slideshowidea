import type { FormatId, GenreId } from "./types";
import type { AppProfile } from "./app-profile";

export type GeneratedSlide = {
  slide_number: number;
  title: string;
  text: string;
  background_idea: string;
};

export type GenerateResponse = {
  topic_title: string;
  slides: GeneratedSlide[];
  caption: string;
  hashtags: string[];
};

export type GenerateRequest = {
  genre: GenreId;
  format: FormatId;
  profile?: AppProfile;
  /** Texte US à adapter (optionnel). */
  sourceText?: string;
};

export const CAROUSEL_JSON_SCHEMA = {
  type: "object",
  properties: {
    topic_title: { type: "string" },
    slides: {
      type: "array",
      minItems: 5,
      maxItems: 5,
      items: {
        type: "object",
        properties: {
          slide_number: { type: "number" },
          title: { type: "string" },
          text: { type: "string" },
          background_idea: { type: "string" },
        },
        required: ["slide_number", "title", "text", "background_idea"],
        additionalProperties: false,
      },
    },
    caption: { type: "string" },
    hashtags: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["topic_title", "slides", "caption", "hashtags"],
  additionalProperties: false,
} as const;
