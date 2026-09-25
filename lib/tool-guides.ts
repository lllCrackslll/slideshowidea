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
      "3 étapes : créer (source US ou IA), affiner, export multi-comptes.",
    steps: [
      "Configure ton app une fois (nom, handle, niche).",
      "Colle une source US ou génère un carrousel → édite les textes.",
      "Exporte le ZIP pour tous tes comptes — fonds auto ou images custom.",
    ],
  },
  "/import": {
    status: "functional",
    statusHint: "Importe un carrousel photo TikTok public via son URL.",
    steps: [
      "Colle le lien TikTok (format /video/…, carrousel photo public).",
      "Clique Importer — les slides s'affichent en aperçu.",
      "Télécharge slide par slide ou exporte le ZIP + légende.",
      "Utilise les prompts IA pour traduire/modifier les images dans ton outil préféré.",
    ],
  },
  "/repurpose": {
    status: "partial",
    statusHint:
      "FFmpeg dans le navigateur. Vidéos courtes (< ~60 s) recommandées.",
    steps: [
      "Choisis un preset ou ajuste les filtres.",
      "Dépose une ou plusieurs vidéos MP4/MOV/MKV.",
      "Génère les variantes → télécharge une vidéo ou le ZIP.",
    ],
  },
  "/planning": {
    status: "functional",
    statusHint: "Comptes, horaires, checklist journalière + règles anti-ban.",
    steps: [
      "Règle le nombre de comptes et l'écart entre posts.",
      "Renomme chaque compte TikTok.",
      "Publie depuis le ZIP Studio, coche chaque post publié.",
    ],
  },
  "/image-spoofer": {
    status: "functional",
    statusHint: "Presets Default/TikTok/Instagram + réglages custom, traitement local Canvas.",
    steps: [
      "Dépose une ou plusieurs images PNG, JPG ou WebP.",
      "Choisis un preset ou ajuste les curseurs (Simple / Advanced).",
      "Active « Variantes uniques » pour générer plusieurs dossiers avec des images différentes.",
      "Exporte une image, un ZIP simple, ou un pack multi-variantes.",
    ],
  },
  "/converter": {
    status: "functional",
    statusHint: "Conversion PNG/WebP → JPEG locale.",
    steps: [
      "Dépose une image.",
      "Le JPEG se télécharge automatiquement.",
    ],
  },
  "/reducer": {
    status: "functional",
    statusHint: "Compression JPEG locale.",
    steps: [
      "Règle la qualité JPEG.",
      "Dépose une image — téléchargement automatique.",
    ],
  },
};

export function getToolGuide(href: string): ToolGuide | undefined {
  return TOOL_GUIDES[href];
}
