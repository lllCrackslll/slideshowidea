export type ImageAdjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  noise: number;
  blurBorder: number;
  quality: number;
};

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
  flipH: false,
  flipV: false,
  noise: 0,
  blurBorder: 0,
  quality: 0.88,
};

export async function loadImageFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function drawAdjustedImage(
  img: HTMLImageElement,
  adjustments: ImageAdjustments,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");

  const rad = (adjustments.rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  canvas.width = img.width * cos + img.height * sin;
  canvas.height = img.width * sin + img.height * cos;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.scale(adjustments.flipH ? -1 : 1, adjustments.flipV ? -1 : 1);
  ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  if (adjustments.noise > 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data } = imageData;
    const amount = adjustments.noise * 2.55;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * amount;
      data[i] = clamp(data[i] + n);
      data[i + 1] = clamp(data[i + 1] + n);
      data[i + 2] = clamp(data[i + 2] + n);
    }
    ctx.putImageData(imageData, 0, 0);
  }

  if (adjustments.blurBorder > 0) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) * 0.25,
      canvas.width / 2,
      canvas.height / 2,
      Math.max(canvas.width, canvas.height) * 0.75,
    );
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, `rgba(0,0,0,${adjustments.blurBorder / 100})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/jpeg",
  quality = 0.88,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export impossible."))),
      type,
      quality,
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
