import type { LucideIcon } from "lucide-react";
import { Clapperboard, Settings2 } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

/** Parcours unifié sur / — Repurpose seul outil séparé */
export const MAIN_NAV: NavItem[] = [];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/setup", label: "Comptes", icon: Settings2 },
  { href: "/repurpose", label: "Repurpose", icon: Clapperboard },
];
