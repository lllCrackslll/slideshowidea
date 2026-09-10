import JSZip from "jszip";

function folderSlug(label: string) {
  return (
    label
      .replace(/^@/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32) || "compte"
  );
}

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
  return "jpg";
}

export async function downloadSlidesZip(params: {
  campaignName: string;
  caption?: string;
  accounts: Array<{ id: string; label: string }>;
  getImages: (accountId: string) => string[];
}): Promise<number> {
  const zip = new JSZip();
  let exported = 0;

  for (const acc of params.accounts) {
    const images = params.getImages(acc.id);
    if (!images.length) continue;

    const root = zip.folder(folderSlug(acc.label));
    if (!root) continue;

    for (let i = 0; i < images.length; i += 1) {
      const blob = await urlToBlob(images[i]);
      root.file(`slide-${i + 1}.${extFromBlob(blob)}`, blob);
    }

    if (params.caption?.trim()) {
      root.file("caption.txt", params.caption.trim());
    }

    exported += 1;
  }

  if (!exported) return 0;

  const blob = await zip.generateAsync({ type: "blob" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${params.campaignName.slice(0, 24)}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);

  return exported;
}
