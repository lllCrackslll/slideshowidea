import { ToolPage } from "@/components/shell/tool-page";

const SECTIONS = [
  {
    title: "Content Engine",
    body: "Choisis Format (Story / Short) et Thème (Motivation / Conseil). Génère un carrousel 5 slides avec OpenAI. Édite le texte, copie la légende, exporte les PNG en ZIP.",
  },
  {
    title: "Repurpose Bot",
    body: "Upload une ou plusieurs vidéos. Presets Instagram/TikTok + presets custom (localStorage). Filtres : framerate, bitrate, saturation, contrast, brightness, vignette, gamma, speed, zoom, noise, rotation, lens correction, pixel shift, waveform shift, flip, blurred border, cutoff, dimensions, watermark, metadata GPS US. Génère N copies uniques par fichier.",
  },
  {
    title: "Image Spoofer",
    body: "Simple : brightness, contrast, saturation. Advanced : rotation, noise, blur border, flip. Export JPEG.",
  },
  {
    title: "Converter",
    body: "Image → JPEG (instantané). Video → MP4 et Video → GIF via FFmpeg WASM (chargement initial ~30 Mo).",
  },
  {
    title: "Detector",
    body: "Compare deux images et affiche un score de similarité estimé. SSIM vidéo = desktop uniquement.",
  },
  {
    title: "File Reducer",
    body: "Compresse une image en JPEG avec qualité réglable.",
  },
  {
    title: "Face Swap",
    body: "Nécessite une API cloud externe — non incluse dans cette version web.",
  },
  {
    title: "Limites vs TikFusion desktop",
    body: "Pas de licence KeyAuth ni HWID. Pas de tonemap HDR auto (zscale). Les fichiers se téléchargent au lieu d'aller dans un dossier disque. Vidéos longues ou lourdes (> ~60 s / 50 Mo) peuvent être lentes ou échouer dans le navigateur. Face Swap et SSIM vidéo restent desktop uniquement.",
  },
];

export function DocsTool() {
  return (
    <ToolPage title="Documentation" subtitle="Guide Kognia Studio / TikFusion web.">
      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <article
            key={section.title}
            className="rounded-xl border border-[#27272a] bg-[#0c0c0e] p-4"
          >
            <h2 className="text-sm font-medium text-zinc-100">{section.title}</h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              {section.body}
            </p>
          </article>
        ))}
      </div>
    </ToolPage>
  );
}
