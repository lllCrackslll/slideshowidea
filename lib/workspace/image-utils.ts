export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Lecture fichier impossible"));
    reader.readAsDataURL(file);
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadImageUrl(url: string, filename: string) {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    downloadDataUrl(url, filename);
    return;
  }

  const res = await fetch(
    `/api/sourcing/image?url=${encodeURIComponent(url)}`,
  );
  if (!res.ok) throw new Error("Téléchargement impossible");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  downloadDataUrl(objectUrl, filename);
  URL.revokeObjectURL(objectUrl);
}

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}
