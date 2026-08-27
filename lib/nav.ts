import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Clapperboard,
  FileDown,
  GitCompare,
  ImageIcon,
  LayoutDashboard,
  ScanFace,
  Sparkles,
  Wand2,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

const TOOL_DESCRIPTIONS: Record<string, string> = {
  "/content-engine":
    "Génère et exporte des carrousels TikTok study avec OpenAI.",
  "/repurpose":
    "Crée des variantes uniques de vidéos (filtres, metadata, watermark).",
  "/image-spoofer":
    "Transforme des images pour éviter les doublons détectés.",
  "/faceswap": "Échange de visages sur images ou courtes vidéos.",
  "/converter": "Convertit images, vidéos et GIF entre formats.",
  "/detector": "Compare deux fichiers et estime leur similarité.",
  "/reducer": "Réduit le poids des images en JPEG.",
  "/docs": "Guide d'utilisation des outils.",
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content-engine", label: "Content Engine", icon: Sparkles },
  { href: "/repurpose", label: "Repurpose", icon: Clapperboard },
  { href: "/image-spoofer", label: "Image Spoofer", icon: Wand2 },
  { href: "/faceswap", label: "Face Swap", icon: ScanFace },
  { href: "/converter", label: "Converter", icon: ImageIcon },
  { href: "/detector", label: "Detector", icon: GitCompare },
  { href: "/reducer", label: "Reducer", icon: FileDown },
  { href: "/docs", label: "Docs", icon: BookOpen },
];

export const DASHBOARD_TOOLS: NavItem[] = MAIN_NAV.filter(
  (item) => item.href !== "/",
).map((item) => ({
  ...item,
  description: TOOL_DESCRIPTIONS[item.href] ?? "",
}));
