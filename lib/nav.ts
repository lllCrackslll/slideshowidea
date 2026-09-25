import type { LucideIcon } from "lucide-react";
import { Clapperboard, ImageIcon, Link2 } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

export const TOOLS: NavItem[] = [
  {
    href: "/import",
    label: "Import",
    icon: Link2,
    description: "Télécharge les slides d'un carrousel TikTok à partir de son lien.",
  },
  {
    href: "/repurpose",
    label: "Video",
    icon: Clapperboard,
    description: "Crée des variantes uniques de vidéos (filtres, metadata, watermark).",
  },
  {
    href: "/image-spoofer",
    label: "Image",
    icon: ImageIcon,
    description: "Transforme des images pour éviter les doublons détectés.",
  },
];

/** @deprecated Utiliser TOOLS */
export const MAIN_NAV: NavItem[] = [];
/** @deprecated Utiliser TOOLS */
export const SECONDARY_NAV: NavItem[] = TOOLS;
