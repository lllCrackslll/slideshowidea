import type { GenerateResponse } from "./api-types";
import type { Carousel, GenreId, Slide } from "./types";

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeHashtags(tags: string[]): string[] {
  return tags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
}

export function mapGeneratedToCarousel(
  data: GenerateResponse,
  genre: GenreId,
): Carousel {
  const slides: Slide[] = data.slides
    .slice()
    .sort((a, b) => a.slide_number - b.slide_number)
    .map((slide) => {
      const title = slide.title?.trim() ?? "";
      const text = slide.text?.trim() ?? "";
      // Format Short : l'IA met parfois tout dans title et laisse text vide.
      const visibleText =
        text && title && title !== text ? `${title}\n${text}` : text || title;

      return {
        id: uid("s"),
        slideNumber: slide.slide_number,
        title: text && title && title !== text ? title : undefined,
        text: visibleText,
        visual: slide.background_idea,
      };
    });

  return {
    id: uid("c"),
    genre,
    topic: data.topic_title,
    slides,
    caption: data.caption,
    hashtags: normalizeHashtags(data.hashtags),
  };
}
