import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";
import { getToolGuide } from "@/lib/tool-guides";

const SECTIONS = [
  {
    title: "Content Engine",
    body: "Génère des carrousels TikTok (Story / Short), exporte un pack multi-comptes avec planning, checklist, b-roll perso et banque de hooks.",
  },
  {
    title: "Image Spoofer",
    body: "Simple : brightness, contrast, saturation. Advanced : rotation, noise, blur border, flip. Export JPEG local.",
  },
  {
    title: "Converter",
    body: "Convertit PNG et WebP en JPEG instantanément dans le navigateur.",
  },
  {
    title: "File Reducer",
    body: "Compresse une image en JPEG avec qualité réglable.",
  },
];

export function DocsTool() {
  return (
    <ToolPage title="Documentation" subtitle="Guide carrousels.studio.">
      <div className="space-y-3">
        {SECTIONS.map((section) => (
          <article key={section.title} className="k-card">
            <h2 className="text-sm font-medium text-[#1d1d1f]">
              {section.title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#86868b]">
              {section.body}
            </p>
          </article>
        ))}
      </div>

      {getToolGuide("/docs") ? (
        <ToolTutorial guide={getToolGuide("/docs")!} className="mt-6" />
      ) : null}
    </ToolPage>
  );
}
