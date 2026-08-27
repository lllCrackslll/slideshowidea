import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  FileDown,
  ImageIcon,
  LayoutDashboard,
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
    "Génère des carrousels et exporte un pack prêt pour tes comptes TikTok.",
  "/image-spoofer":
    "Transforme des images pour créer des variantes uniques.",
  "/converter": "Convertit PNG/WebP en JPEG instantanément.",
  "/reducer": "Réduit le poids des images en JPEG.",
  "/planning":
    "Gère tes comptes, horaires et coche chaque publication du jour.",
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/content-engine", label: "Content Engine", icon: Sparkles },
  { href: "/image-spoofer", label: "Image Spoofer", icon: Wand2 },
  { href: "/converter", label: "Converter", icon: ImageIcon },
  { href: "/reducer", label: "Reducer", icon: FileDown },
  { href: "/planning", label: "Planning", icon: CalendarClock },
];

export const DASHBOARD_TOOLS: NavItem[] = MAIN_NAV.filter(
  (item) => item.href !== "/",
).map((item) => ({
  ...item,
  description: TOOL_DESCRIPTIONS[item.href] ?? "",
}));
