import JSZip from "jszip";

async function urlToBlob(url: string): Promise<Blob> {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const res = await fetch(url);
    return res.blob();
  }
  const res = await fetch(`/api/sourcing/image?url=${encodeURIComponent(url)}`);
  return res.blob();
}

function extFromBlob(blob: Blob) {
  if (blob.type.includes("png")) return "png";
  if (blob.type.includes("webp")) return "webp";
  if (blob.type.includes("mp4")) return "mp4";
  if (blob.type.includes("webm")) return "webm";
  return "jpg";
}

export async function downloadSlidesZip(params: {
  campaignName: string;
  caption?: string;
  getImages: () => string[];
  getVideos?: () => string[];
}): Promise<number> {
  const images = params.getImages();
  const videos = params.getVideos?.() ?? [];

  if (!images.length && !videos.length) return 0;

  const zip = new JSZip();
  const root = zip.folder("export");
  if (!root) return 0;

  for (let i = 0; i < images.length; i += 1) {
    const blob = await urlToBlob(images[i]);
    root.file(`slide-${i + 1}.${extFromBlob(blob)}`, blob);
  }

  for (let i = 0; i < videos.length; i += 1) {
    const blob = await urlToBlob(videos[i]);
    root.file(`video-${i + 1}.${extFromBlob(blob)}`, blob);
  }

  if (params.caption?.trim()) {
    root.file("caption.txt", params.caption.trim());
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${params.campaignName.slice(0, 24)}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);

  return 1;
}
