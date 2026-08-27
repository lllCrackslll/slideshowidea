export type ToolStatus = "functional" | "partial" | "unavailable";

export type ToolGuide = {
  status: ToolStatus;
  statusHint: string;
  steps: string[];
};

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  "/content-engine": {
    status: "functional",
    statusHint:
      "Workflow complet : 3 concepts, comptes nommés, planning horaire, checklist, b-roll perso, banque de hooks, historique local.",
    steps: [
      "Clique « 3 concepts du jour » puis nomme tes comptes TikTok.",
      "Consulte le planning horaire et exporte le pack journalier.",
      "Coche la checklist au fur et à mesure des publications.",
      "Banque de hooks pour le slide 1 · b-roll perso pour des visuels uniques.",
    ],
  },
  "/image-spoofer": {
    status: "functional",
    statusHint:
      "Traitement 100 % local dans le navigateur (Canvas) — instantané, sans upload serveur.",
    steps: [
      "Dépose une image PNG, JPG ou WebP.",
      "Ajuste luminosité, contraste, saturation (onglet Advanced : rotation, bruit, bordure floue, flip).",
      "Vérifie l'aperçu en direct à droite.",
      "Clique Exporter l'image pour télécharger le JPEG modifié.",
    ],
  },
  "/converter": {
    status: "functional",
    statusHint: "Conversion PNG/WebP → JPEG locale et instantanée.",
    steps: [
      "Dépose une image PNG, JPG ou WebP.",
      "La conversion démarre automatiquement.",
      "Le JPEG se télécharge immédiatement.",
    ],
  },
  "/reducer": {
    status: "functional",
    statusHint:
      "Compression JPEG locale instantanée — affiche le poids avant/après.",
    steps: [
      "Règle le curseur Qualité JPEG (30–95 %).",
      "Dépose une image — la compression démarre automatiquement.",
      "Le fichier réduit se télécharge et le message indique Ko avant → après.",
    ],
  },
  "/docs": {
    status: "functional",
    statusHint: "Page d'aide statique.",
    steps: [
      "Consulte le résumé de chaque outil disponible.",
      "Reviens ici si tu hésites sur quel outil utiliser.",
    ],
  },
};

export function getToolGuide(href: string): ToolGuide | undefined {
  return TOOL_GUIDES[href];
}
