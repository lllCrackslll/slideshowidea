export type ToolStatus = "functional" | "partial" | "unavailable";

export type ToolGuide = {
  status: ToolStatus;
  statusHint: string;
  steps: string[];
};

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  "/content-engine": {
    status: "functional",
    statusHint: "3 étapes : générer, éditer, télécharger le pack.",
    steps: [
      "Étape 1 : choisis Motivation ou Conseil → Générer 3 carrousels.",
      "Étape 2 : modifie les textes et la légende si besoin.",
      "Étape 3 : télécharge le pack (nombre de comptes = Planning).",
    ],
  },
  "/planning": {
    status: "functional",
    statusHint:
      "Configure tes comptes une fois, coche chaque post publié dans la journée.",
    steps: [
      "Règle le nombre de comptes et de posts par jour.",
      "Renomme chaque compte TikTok.",
      "Suis le planning horaire et coche au fur et à mesure.",
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
};

export function getToolGuide(href: string): ToolGuide | undefined {
  return TOOL_GUIDES[href];
}
