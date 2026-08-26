import type { Carousel, Format, FormatId, Genre, GenreId } from "./types";

export const FORMATS: Format[] = [
  { id: "story", emoji: "📖", label: "Story" },
  { id: "short", emoji: "⚡", label: "Short" },
];

export const GENRES: Genre[] = [
  { id: "motivation", emoji: "🔥", label: "Motivation" },
  { id: "conseil", emoji: "💡", label: "Conseil" },
];

export function genreLabel(id: GenreId): string {
  return GENRES.find((g) => g.id === id)?.label ?? id;
}

export function formatLabel(id: FormatId): string {
  return FORMATS.find((f) => f.id === id)?.label ?? id;
}

export const DEFAULT_CAROUSEL: Carousel = {
  id: "default",
  genre: "conseil",
  topic: "Courbe de l'oubli",
  slides: [
    {
      id: "d1",
      text: "Je révisais 4 heures.\nTrois jours plus tard, j'avais tout oublié.",
      visual:
        "Chambre d'étudiant la nuit, notes éparpillées, écran qui éclaire le visage.",
    },
    {
      id: "d2",
      text: "J'ai compris : relire ne servait à rien.\nJe me croyais prêt, j'étais juste familier avec le cours.",
      visual:
        "Graphique Ebbinghaus minimaliste, ligne blanche qui chute sur fond noir.",
    },
    {
      id: "d3",
      text: "Mon fix : 4 rappels espacés.\nJ+1 · J+3 · J+7 · J+30 — sans tricher avec mes notes.",
      visual:
        "Timeline horizontale avec 4 points lumineux, esthétique Linear.",
    },
    {
      id: "d4",
      text: "Perso je scanne mes cours sur Kognia pour sortir mes fiches et quiz en 10 s.",
      visual: "iPad, Apple Pencil, page blanche, café, lumière tamisée.",
    },
    {
      id: "d5",
      text: "Ton cerveau n'est pas cassé.\nTon système l'est — et tu peux le changer. Lien en bio.",
      visual: "Bureau minimaliste sombre avec café et iPad.",
    },
  ],
  caption:
    "J'ai passé des semaines à relire mes cours sans rien retenir.\n\nLa courbe de l'oubli m'a ouvert les yeux : sans rappels, tout s'évapore en 24h.\n\nMon protocole :\n→ J+1 rappel sans notes\n→ J+3 même chose\n→ J+7 mix + cartes\n→ J+30 dernier passage\n\nPerso j'utilise Kognia pour accélérer les fiches et les quiz.\n\nSauvegarde si tu veux arrêter de réviser dans le vide.",
  hashtags: [
    "#etudiant",
    "#study",
    "#studytok",
    "#revision",
    "#conseil",
    "#productivite",
    "#learnontiktok",
    "#methodes",
    "#focus",
  ],
};

export function formatCarouselText(carousel: Carousel): string {
  const slides = carousel.slides
    .map((slide, index) => {
      return [
        `SLIDE ${index + 1}/5`,
        slide.title ? `${slide.title}\n${slide.text}` : slide.text,
        "",
        `Idée de visuel : ${slide.visual}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return [
    `KOGNIA — ${genreLabel(carousel.genre)}`,
    carousel.topic ? `Sujet : ${carousel.topic}` : null,
    "",
    slides,
    "",
    "LÉGENDE",
    carousel.caption,
    "",
    "HASHTAGS",
    carousel.hashtags.join(" "),
  ]
    .filter((line) => line !== null)
    .join("\n");
}
