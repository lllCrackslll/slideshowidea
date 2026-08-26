export type ExportSlide = {
  slideNumber: number;
  title?: string;
  text: string;
};

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT_SIZE = 64;
const LINE_HEIGHT = 1.22;
const STROKE_WIDTH = 14;
const HORIZONTAL_PADDING = 96;
const MAX_TEXT_WIDTH = WIDTH - HORIZONTAL_PADDING * 2;

const BROLL_POOLS = {
  hook: ["/broll/hook-1.jpg", "/broll/hook-2.jpg"],
  content: [
    "/broll/content-1.jpg",
    "/broll/content-2.jpg",
    "/broll/content-3.jpg",
  ],
  app: ["/broll/app-1.jpg", "/broll/app-2.jpg"],
  cta: ["/broll/cta-1.jpg", "/broll/cta-2.jpg"],
} as const;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickBrollPath(slideNumber: number): string {
  if (slideNumber === 1) return pickRandom(BROLL_POOLS.hook);
  if (slideNumber === 4) return pickRandom(BROLL_POOLS.app);
  if (slideNumber === 5) return pickRandom(BROLL_POOLS.cta);
  return pickRandom(BROLL_POOLS.content);
}

function randomZoom(): number {
  return 1 + (Math.random() * 0.04 + 0.01);
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
): Promise<void> {
  const src = pickBrollPath(slideNumber);
  try {
    const img = await loadImage(src);
    const zoom = randomZoom();
    const drawWidth = WIDTH * zoom;
    const drawHeight = HEIGHT * zoom;
    const offsetX = (WIDTH - drawWidth) / 2;
    const offsetY = (HEIGHT - drawHeight) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  } catch {
    drawFallbackBackground(ctx);
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  overlay.addColorStop(0, "rgba(0, 0, 0, 0.52)");
  overlay.addColorStop(0.45, "rgba(0, 0, 0, 0.38)");
  overlay.addColorStop(1, "rgba(0, 0, 0, 0.62)");
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

async function renderSlideToCanvas(slide: ExportSlide): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible.");

  await drawBackground(ctx, slide.slideNumber);

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

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Export PNG impossible."));
      },
      "image/png",
      1,
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
    const blob = await canvasToBlob(canvas);
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
