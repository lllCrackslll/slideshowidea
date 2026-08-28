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
  topic: "Exemple — Courbe de l'oubli",
  slides: [
    {
      id: "d1",
      text: "Je révisais 4 heures.\nTrois jours plus tard, j'avais tout oublié.",
      visual:
        "Chambre la nuit, notes éparpillées, écran qui éclaire le visage.",
    },
    {
      id: "d2",
      text: "Relire ne servait à rien.\nJ'étais familier avec le cours, pas prêt.",
      visual:
        "Graphique minimaliste, ligne blanche qui chute sur fond noir.",
    },
    {
      id: "d3",
      text: "Mon fix : 4 rappels espacés.\nJ+1 · J+3 · J+7 · J+30.",
      visual: "Timeline horizontale avec 4 points lumineux, esthétique sombre.",
    },
    {
      id: "d4",
      text: "J'utilise Mon app pour mes fiches et quiz en 10 s.",
      visual: "Smartphone, bureau minimaliste, lumière tamisée.",
    },
    {
      id: "d5",
      text: "Ton système peut changer.\n@monapp en bio.",
      visual: "Bureau sombre avec café et téléphone.",
    },
  ],
  caption:
    "J'ai passé des semaines à relire sans rien retenir.\n\nLa courbe de l'oubli : sans rappels, tout s'évapore en 24h.\n\nMon protocole J+1, J+3, J+7, J+30.\n\nSauvegarde si tu veux arrêter de réviser dans le vide.",
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
