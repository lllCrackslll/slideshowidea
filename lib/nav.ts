import type { LucideIcon } from "lucide-react";
import {
  Clapperboard,
  FileImage,
  Minimize2,
  Sparkles,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const TOOLS: NavItem[] = [
  {
    href: "/repurpose",
    label: "Repurpose",
    icon: Clapperboard,
    description: "Crée des variantes uniques de vidéos (filtres, metadata, watermark).",
  },
  {
    href: "/converter",
    label: "Converter",
    icon: FileImage,
    description: "Convertit PNG et WebP en JPEG instantanément.",
  },
  {
    href: "/reducer",
    label: "Reducer",
    icon: Minimize2,
    description: "Compresse le poids de tes images JPEG.",
  },
  {
    href: "/image-spoofer",
    label: "Spoofer",
    icon: Sparkles,
    description: "Transforme des images pour éviter les doublons détectés.",
  },
];

/** @deprecated Utiliser TOOLS */
export const MAIN_NAV: NavItem[] = [];
/** @deprecated Utiliser TOOLS */
export const SECONDARY_NAV: NavItem[] = TOOLS;
