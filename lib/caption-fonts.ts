import {
  Anton,
  Bebas_Neue,
  Montserrat,
  Oswald,
  Permanent_Marker,
  Playfair_Display,
} from "next/font/google";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap" });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });
const montserrat = Montserrat({
  weight: "800",
  subsets: ["latin"],
  display: "swap",
});
const oswald = Oswald({ weight: "700", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
});
const marker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export type CaptionFontId =
  | "tiktok"
  | "anton"
  | "bebas"
  | "montserrat"
  | "oswald"
  | "playfair"
  | "marker";

export type CaptionFont = {
  id: CaptionFontId;
  label: string;
  family: string;
  weight: number;
  stroke: number;
  className?: string;
};

export const CAPTION_FONTS: CaptionFont[] = [
  {
    id: "tiktok",
    label: "TikTok",
    family: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
    weight: 800,
    stroke: 0.18,
  },
  {
    id: "anton",
    label: "Anton",
    family: anton.style.fontFamily,
    weight: 400,
    stroke: 0.14,
    className: anton.className,
  },
  {
    id: "bebas",
    label: "Bebas",
    family: bebas.style.fontFamily,
    weight: 400,
    stroke: 0.12,
    className: bebas.className,
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: montserrat.style.fontFamily,
    weight: 800,
    stroke: 0.16,
    className: montserrat.className,
  },
  {
    id: "oswald",
    label: "Oswald",
    family: oswald.style.fontFamily,
    weight: 700,
    stroke: 0.14,
    className: oswald.className,
  },
  {
    id: "playfair",
    label: "Playfair",
    family: playfair.style.fontFamily,
    weight: 700,
    stroke: 0.1,
    className: playfair.className,
  },
  {
    id: "marker",
    label: "Marker",
    family: marker.style.fontFamily,
    weight: 400,
    stroke: 0.08,
    className: marker.className,
  },
];

export const DEFAULT_CAPTION_FONT_ID: CaptionFontId = "tiktok";
export const DEFAULT_CAPTION_SIZE = 78;
export const MIN_CAPTION_SIZE = 28;
export const MAX_CAPTION_SIZE = 140;

export function getCaptionFont(id: CaptionFontId): CaptionFont {
  return CAPTION_FONTS.find((font) => font.id === id) ?? CAPTION_FONTS[0];
}
