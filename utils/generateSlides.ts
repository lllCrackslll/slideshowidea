import {
  accountFolderName,
  buildVariantProfiles,
  type VariantProfile,
} from "@/lib/carousel-variants";
import { accountFolderSlug } from "@/lib/distribution/accounts";
import {
  brollPathForSlide,
  getMergedBrollPools,
} from "@/lib/broll/custom-broll";
import type JSZip from "jszip";

export type ExportSlide = {
  slideNumber: number;
  title?: string;
  text: string;
};

export type DistributionPackInput = {
  slides: ExportSlide[];
  topicTitle: string;
  caption: string;
  hashtags: string[];
  accountCount: number;
  accountNames?: string[];
  accountNameOffset?: number;
  conceptLabel?: string;
  /** 5 data URLs — slide 1 à 5. Prioritaire sur le b-roll par défaut. */
  slideBackgrounds?: (string | null)[];
  onProgress?: (done: number, total: number) => void;
};

export type DailyPackConcept = {
  topicTitle: string;
  caption: string;
  hashtags: string[];
  slides: ExportSlide[];
  accountCount: number;
  accountNames?: string[];
  accountOffset?: number;
};

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT_SIZE = 64;
const LINE_HEIGHT = 1.22;
const STROKE_WIDTH = 14;
const HORIZONTAL_PADDING = 96;
const MAX_TEXT_WIDTH = WIDTH - HORIZONTAL_PADDING * 2;

function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function resolveAccountFolder(
  localIndex: number,
  accountNames?: string[],
  offset = 0,
): string {
  const globalIndex = offset + localIndex;
  const name = accountNames?.[globalIndex]?.trim();
  if (name) return accountFolderSlug(name, globalIndex);
  return accountFolderName(globalIndex);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Impossible de charger ${src}`));
    img.src = src;
  });
}

function drawFallbackBackground(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#1a1a22");
  gradient.addColorStop(0.55, "#0f1218");
  gradient.addColorStop(1, "#08080c");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  slideNumber: number,
  variant: VariantProfile,
  slideBackgrounds?: (string | null)[],
): Promise<void> {
  const rand = seededRandom(variant.seed + slideNumber * 131);
  const customSrc = slideBackgrounds?.[slideNumber - 1] ?? null;
  const pools = getMergedBrollPools();
  const src =
    customSrc?.trim() ||
    brollPathForSlide(slideNumber, pools, rand);
  const zoom = 1 + 0.01 + variant.zoomExtra + rand() * 0.04;

  try {
    const img = await loadImage(src);
    const drawWidth = WIDTH * zoom;
    const drawHeight = HEIGHT * zoom;
    const offsetX = (WIDTH - drawWidth) / 2;
    const offsetY = (HEIGHT - drawHeight) / 2;
    ctx.filter = `brightness(${variant.brightness}%) contrast(${variant.contrast}%) saturate(${variant.saturation}%)`;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    ctx.filter = "none";
  } catch {
    drawFallbackBackground(ctx);
  }

  const top = variant.overlayOpacity + 0.04;
  const mid = variant.overlayOpacity - 0.06;
  const bottom = variant.overlayOpacity + 0.08;
  const overlay = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  overlay.addColorStop(0, `rgba(0, 0, 0, ${top})`);
  overlay.addColorStop(0.45, `rgba(0, 0, 0, ${mid})`);
  overlay.addColorStop(1, `rgba(0, 0, 0, ${bottom})`);
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }

    let current = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const candidate = `${current} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function drawStrokedTextBlock(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerY: number,
): void {
  const lineHeightPx = FONT_SIZE * LINE_HEIGHT;
  const blockHeight = lines.length * lineHeightPx;
  let y = centerY - blockHeight / 2 + lineHeightPx / 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${FONT_SIZE}px Arial, Helvetica, sans-serif`;

  for (const line of lines) {
    ctx.lineWidth = STROKE_WIDTH;
    ctx.strokeStyle = "#000000";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    ctx.strokeText(line, WIDTH / 2, y);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(line, WIDTH / 2, y);

    y += lineHeightPx;
  }
}

function slideDisplayText(slide: ExportSlide): string {
  const title = slide.title?.trim();
  const text = slide.text.trim();
  if (title && title !== text) {
    return `${title}\n${text}`;
  }
  return text || title || "";
}

async function renderSlideToCanvas(
  slide: ExportSlide,
  variant?: VariantProfile,
  slideBackgrounds?: (string | null)[],
): Promise<HTMLCanvasElement> {
  const profile =
    variant ??
    buildVariantProfiles(1, slide.slideNumber * 1000)[0];

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible.");

  await drawBackground(ctx, slide.slideNumber, profile, slideBackgrounds);

  ctx.font = `600 34px Arial, Helvetica, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
  ctx.fillText(`${slide.slideNumber} / 5`, WIDTH / 2, 88);

  ctx.font = "500 38px Arial, Helvetica, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.fillText("@kognia.app", WIDTH / 2, HEIGHT - 72);

  const lines = wrapText(ctx, slideDisplayText(slide), MAX_TEXT_WIDTH);
  drawStrokedTextBlock(ctx, lines, HEIGHT / 2);

  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" = "image/png",
  quality = 1,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Export impossible."));
      },
      type,
      quality,
    );
  });
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function captionFile(caption: string, hashtags: string[]): string {
  return [
    caption.trim(),
    "",
    "── HASHTAGS ──",
    hashtags.join(" "),
    "",
    "── PUBLICATION TIKTOK ──",
    "1. Ouvre TikTok → Créer → Photo",
    "2. Importe slide-1.jpg à slide-5.jpg dans l'ordre",
    "3. Colle la légende ci-dessus",
    "4. Publie",
  ].join("\n");
}

function readmeDistribution(accountCount: number, conceptLabel: string): string {
  return [
    `Pack distribution Kognia — ${conceptLabel}`,
    "",
    `${accountCount} dossiers (compte-01 … compte-${String(accountCount).padStart(2, "0")})`,
    "Chaque dossier = 1 compte TikTok avec visuels uniques (même texte, légères variations sur tes 5 fonds).",
    "",
    "Workflow rapide :",
    "• 1 dossier = 1 compte = 1 carrousel",
    "• Ouvre caption.txt dans chaque dossier pour la légende",
    "• Importe les 5 JPG dans TikTok dans l'ordre",
  ].join("\n");
}

async function addConceptToZip(
  zip: JSZip,
  basePath: string,
  input: DistributionPackInput,
): Promise<void> {
  const ordered = input.slides
    .slice()
    .sort((a, b) => a.slideNumber - b.slideNumber)
    .slice(0, 5);

  const profiles = buildVariantProfiles(input.accountCount);
  const totalSteps = input.accountCount * ordered.length;
  let done = 0;

  zip.file(
    `${basePath}/README.txt`,
    readmeDistribution(input.accountCount, input.conceptLabel ?? input.topicTitle),
  );

  for (const profile of profiles) {
    const folder = `${basePath}/${resolveAccountFolder(
      profile.index,
      input.accountNames,
      input.accountNameOffset ?? 0,
    )}`;
    zip.file(`${folder}/caption.txt`, captionFile(input.caption, input.hashtags));

    for (const slide of ordered) {
      const canvas = await renderSlideToCanvas(
        slide,
        profile,
        input.slideBackgrounds,
      );
      const blob = await canvasToBlob(canvas, "image/jpeg", profile.jpegQuality);
      zip.file(`${folder}/slide-${slide.slideNumber}.jpg`, blob);
      done += 1;
      input.onProgress?.(done, totalSteps);
    }
  }
}

export async function downloadDistributionPack(
  input: DistributionPackInput,
): Promise<void> {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import("jszip"),
    import("file-saver"),
  ]);

  const zip = new JSZip();
  const slug = slugify(input.topicTitle) || "carrousel";

  await addConceptToZip(zip, slug, input);

  const archive = await zip.generateAsync({ type: "blob" });
  saveAs(archive, `${slug}-distribution-${input.accountCount}comptes.zip`);
}

export async function downloadDailyPack(
  concepts: DailyPackConcept[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import("jszip"),
    import("file-saver"),
  ]);

  const zip = new JSZip();
  const date = new Date().toISOString().slice(0, 10);
  const root = `pack-journalier-${date}`;

  const totalSteps = concepts.reduce(
    (sum, c) => sum + c.accountCount * 5,
    0,
  );

  zip.file(
    `${root}/README.txt`,
    [
      `Pack journalier Kognia — ${date}`,
      "",
      `${concepts.length} concept(s), ${concepts.reduce((s, c) => s + c.accountCount, 0)} comptes au total`,
      "",
      "Structure : concept-XX-nom/compte-YY/",
      "Chaque compte a ses propres visuels + caption.txt",
    ].join("\n"),
  );

  let globalOffset = 0;

  for (let i = 0; i < concepts.length; i += 1) {
    const concept = concepts[i];
    const conceptSlug = slugify(concept.topicTitle) || `concept-${i + 1}`;
    const conceptPath = `${root}/concept-${String(i + 1).padStart(2, "0")}-${conceptSlug}`;
    const conceptSteps = concept.accountCount * 5;

    await addConceptToZip(zip, conceptPath, {
      ...concept,
      accountNames: concept.accountNames,
      accountNameOffset: concept.accountOffset ?? 0,
      conceptLabel: concept.topicTitle,
      onProgress: (done) => {
        onProgress?.(globalOffset + done, totalSteps);
      },
    });

    globalOffset += conceptSteps;
  }

  const archive = await zip.generateAsync({ type: "blob" });
  saveAs(archive, `${root}.zip`);
}

export async function downloadSlidesZip(
  slides: ExportSlide[],
  topicTitle: string,
): Promise<void> {
  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import("jszip"),
    import("file-saver"),
  ]);

  const zip = new JSZip();
  const ordered = slides
    .slice()
    .sort((a, b) => a.slideNumber - b.slideNumber)
    .slice(0, 5);

  for (const slide of ordered) {
    const canvas = await renderSlideToCanvas(slide);
    const blob = await canvasToBlob(canvas, "image/png", 1);
    zip.file(`slide-${slide.slideNumber}.png`, blob);
  }

  const archive = await zip.generateAsync({ type: "blob" });
  const slug = slugify(topicTitle) || "kognia-carrousel";
  saveAs(archive, `${slug}-kognia-slides.zip`);
}

export function slidesToExportFormat(
  slides: Array<{
    slideNumber?: number;
    title?: string;
    text: string;
  }>,
): ExportSlide[] {
  return slides.map((slide, index) => ({
    slideNumber: slide.slideNumber ?? index + 1,
    title: slide.title,
    text: slide.text,
  }));
}

export function splitAccountsAcrossConcepts(
  conceptCount: number,
  totalAccounts: number,
): number[] {
  const base = Math.floor(totalAccounts / conceptCount);
  const remainder = totalAccounts % conceptCount;
  return Array.from({ length: conceptCount }, (_, i) =>
    base + (i < remainder ? 1 : 0),
  );
}
