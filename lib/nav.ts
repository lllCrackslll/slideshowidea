import type { LucideIcon } from "lucide-react";
import { Clapperboard } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
};

/** Parcours unifié sur / — Repurpose seul outil séparé */
export const MAIN_NAV: NavItem[] = [];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/repurpose", label: "Repurpose", icon: Clapperboard },
];
