const FONT_FAMILY = '"Arial Black", "Helvetica Neue", Arial, sans-serif';

function wrapWords(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    if (ctx.measureText(word).width <= maxWidth) {
      current = word;
      continue;
    }
    let chunk = "";
    for (const char of word) {
      const next = chunk + char;
      if (ctx.measureText(next).width > maxWidth && chunk) {
        lines.push(chunk);
        chunk = char;
      } else {
        chunk = next;
      }
    }
    current = chunk;
  }

  if (current) lines.push(current);
  return lines;
}

function layoutCaption(
  ctx: CanvasRenderingContext2D,
  caption: string,
  fontSize: number,
  maxWidth: number,
): string[] {
  ctx.font = `800 ${fontSize}px ${FONT_FAMILY}`;
  const lines: string[] = [];
  for (const paragraph of caption.split("\n")) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    lines.push(...wrapWords(ctx, trimmed, maxWidth));
  }
  return lines;
}

/** Dessine une caption centrée, style texte TikTok (blanc + contour noir). */
export function renderCaptionOverlay(
  img: HTMLImageElement,
  caption: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const text = caption.trim();
  if (!text) return canvas;

  const maxWidth = canvas.width * 0.86;
  const maxHeight = canvas.height * 0.7;
  let fontSize = Math.round(canvas.width * 0.082);
  let lines = layoutCaption(ctx, text, fontSize, maxWidth);

  while (fontSize > 24 && lines.length * fontSize * 1.18 > maxHeight) {
    fontSize -= 2;
    lines = layoutCaption(ctx, text, fontSize, maxWidth);
  }

  const lineHeight = fontSize * 1.18;
  const blockHeight = lines.length * lineHeight;
  let y = (canvas.height - blockHeight) / 2 + lineHeight / 2;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  ctx.font = `800 ${fontSize}px ${FONT_FAMILY}`;

  for (const line of lines) {
    if (line) {
      ctx.lineWidth = Math.max(8, fontSize * 0.18);
      ctx.strokeStyle = "#000000";
      ctx.strokeText(line, canvas.width / 2, y);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(line, canvas.width / 2, y);
    }
    y += lineHeight;
  }

  return canvas;
}
