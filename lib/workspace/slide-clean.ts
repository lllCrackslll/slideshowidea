import { DEFAULT_ADJUSTMENTS, drawAdjustedImage } from "@/lib/image-processing";

/** Légère altération pixel + export JPEG sans métadonnées EXIF. */
export async function cleanSlideImage(source: string): Promise<string> {
  if (!source.trim()) return source;

  const img = await loadImage(source);
  const adjustments = {
    ...DEFAULT_ADJUSTMENTS,
    brightness: 100 + (Math.random() - 0.5) * 3,
    contrast: 100 + (Math.random() - 0.5) * 4,
    saturation: 100 + (Math.random() - 0.5) * 5,
    noise: 2 + Math.random() * 3,
    quality: 0.92,
  };

  const canvas = drawAdjustedImage(img, adjustments);
  return canvas.toDataURL("image/jpeg", adjustments.quality);
}

export async function cleanAllSlides(urls: string[]): Promise<string[]> {
  return Promise.all(urls.map((url) => cleanSlideImage(url)));
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
