import type { CampaignSlide } from "./types";
import { gradientForSlide } from "./mock-sourcing";

const WIDTH = 1080;
const HEIGHT = 1920;

export function isGradientPlaceholder(url: string): boolean {
  return url.startsWith("gradient:");
}

export function gradientIndexFromUrl(url: string): number {
  return Number.parseInt(url.replace("gradient:", ""), 10) || 0;
}

export function placeholderUrl(index: number): string {
  return `gradient:${index}`;
}

async function drawSlideBackground(
  ctx: CanvasRenderingContext2D,
  imageUrl: string,
  index: number,
): Promise<void> {
  if (imageUrl && !isGradientPlaceholder(imageUrl)) {
    try {
      const img = await loadImage(imageUrl);
      const scale = Math.max(WIDTH / img.width, HEIGHT / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h);
    } catch {
      drawGradient(ctx, index);
    }
  } else {
    drawGradient(ctx, isGradientPlaceholder(imageUrl) ? gradientIndexFromUrl(imageUrl) : index);
  }

  const overlay = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  overlay.addColorStop(0, "rgba(0,0,0,0.35)");
  overlay.addColorStop(0.5, "rgba(0,0,0,0.15)");
  overlay.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = overlay;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function drawGradient(ctx: CanvasRenderingContext2D, index: number): void {
  const g = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  const presets = [
    ["#1a1a2e", "#16213e", "#0f3460"],
    ["#2d1b4e", "#1a1a2e", "#0d0d12"],
    ["#1e3a5f", "#0f2027", "#203a43"],
    ["#3d2b1f", "#1a1410", "#0d0d0d"],
    ["#1a2332", "#243b55", "#141e30"],
  ];
  const colors = presets[index % presets.length];
  g.addColorStop(0, colors[0]);
  g.addColorStop(0.55, colors[1]);
  g.addColorStop(1, colors[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function imageUrlToJpegBlob(imageUrl: string): Promise<Blob> {
  const res = await fetch(imageUrl);
  const raw = await res.blob();
  if (raw.type === "image/jpeg") return raw;

  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.92);
  });
}

export async function slideToJpegBlob(
  slide: CampaignSlide,
  handle: string,
  asIs: boolean,
): Promise<Blob> {
  if (asIs && slide.imageUrl && !isGradientPlaceholder(slide.imageUrl)) {
    return imageUrlToJpegBlob(slide.imageUrl);
  }
  const canvas = await renderCampaignSlide(slide, handle);
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/jpeg", 0.92);
  });
}

export async function renderCampaignSlide(
  slide: CampaignSlide,
  handle: string,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");

  await drawSlideBackground(ctx, slide.imageUrl, slide.order - 1);

  const fontFamily =
    slide.textStyle.fontFamily === "tiktok"
      ? "Arial, Helvetica, sans-serif"
      : "-apple-system, BlinkMacSystemFont, sans-serif";

  ctx.font = `bold ${slide.textStyle.fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const x = (slide.textStyle.x / 100) * WIDTH;
  const y = (slide.textStyle.y / 100) * HEIGHT;
  const lines = slide.text.split("\n");
  const lineHeight = slide.textStyle.fontSize * 1.25;
  let cy = y - ((lines.length - 1) * lineHeight) / 2;

  for (const line of lines) {
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000";
    ctx.lineJoin = "round";
    ctx.strokeText(line, x, cy);
    ctx.fillStyle = slide.textStyle.color;
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }

  ctx.font = "500 32px Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fillText(handle, WIDTH / 2, HEIGHT - 64);

  return canvas;
}

export function slidePreviewStylePlain(
  imageUrl: string,
  index: number,
): Record<string, string> {
  if (imageUrl && !isGradientPlaceholder(imageUrl)) {
    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  const idx = isGradientPlaceholder(imageUrl) ? gradientIndexFromUrl(imageUrl) : index;
  return { background: gradientForSlide(idx) };
}
