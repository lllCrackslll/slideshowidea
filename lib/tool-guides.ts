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
      "Génération OpenAI, édition, copie légende et export ZIP — nécessite OPENAI_API_KEY (.env.local ou Vercel).",
    steps: [
      "Choisis Format (Story = récit long, Short = quelques mots/slide) et Thème (Motivation ou Conseil).",
      "Clique Générer : l'API crée 5 slides 9:16 + légende + hashtags.",
      "Édite le texte directement sur chaque slide dans l'aperçu.",
      "Copie tout le texte ou télécharge le ZIP de PNG 1080×1920.",
    ],
  },
  "/repurpose": {
    status: "partial",
    statusHint:
      "Tous les filtres TikFusion sont portés (FFmpeg WASM). Vidéos courtes (< ~60 s, < ~50 Mo) recommandées — le premier lancement charge ~30 Mo.",
    steps: [
      "Choisis un preset (Instagram, TikTok) ou ajuste les filtres à droite.",
      "Dépose une ou plusieurs vidéos MP4/MOV/MKV.",
      "Règle le nombre de copies par fichier et ajoute un watermark si besoin.",
      "Clique Générer les variantes — chaque MP4 unique se télécharge automatiquement.",
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
  "/faceswap": {
    status: "unavailable",
    statusHint:
      "Interface seulement — TikFusion desktop utilise une API cloud propriétaire non incluse ici.",
    steps: [
      "Sélectionne une image source (visage) et une cible (image ou vidéo).",
      "Le bouton reste désactivé tant qu'aucune API backend n'est branchée.",
      "Pour l'activer : connecte ta propre API Face Swap côté serveur, ou utilise TikFusion desktop.",
    ],
  },
  "/converter": {
    status: "partial",
    statusHint:
      "Image → JPEG : instantané. Vidéo → MP4 et GIF : FFmpeg WASM (vidéos courtes, ~30 Mo au 1er chargement).",
    steps: [
      "Choisis l'onglet Image, Video ou GIF.",
      "Dépose ton fichier dans la zone — la conversion démarre automatiquement.",
      "Image : conversion locale immédiate en JPEG.",
      "Vidéo/GIF : attends le chargement FFmpeg puis le téléchargement du fichier converti.",
    ],
  },
  "/detector": {
    status: "partial",
    statusHint:
      "Comparaison pixel sur images uniquement — score indicatif, pas le SSIM vidéo du desktop TikFusion.",
    steps: [
      "Dépose deux images (PNG, JPG, WebP) — pas de vidéo.",
      "Clique Comparer pour obtenir un score de similarité en %.",
      "> 85 % = très similaires (risque doublon), < 60 % = plutôt différents.",
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
    statusHint: "Page d'aide statique — pas de traitement média.",
    steps: [
      "Consulte le résumé de chaque outil et les limites vs TikFusion desktop.",
      "Reviens ici si tu hésites sur quel outil utiliser.",
    ],
  },
};

export function getToolGuide(href: string): ToolGuide | undefined {
  return TOOL_GUIDES[href];
}
