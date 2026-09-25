export type SpooferZipEntry = {
  filename: string;
  blob: Blob;
};

export async function downloadSpooferZip(
  entries: SpooferZipEntry[],
  label = "spoof",
  readme?: string,
): Promise<void> {
  if (!entries.length) return;

  const [{ default: JSZip }, { saveAs }] = await Promise.all([
    import("jszip"),
    import("file-saver"),
  ]);

  const zip = new JSZip();
  const used = new Set<string>();

  for (const entry of entries) {
    let name = entry.filename;
    if (used.has(name)) {
      const dot = name.lastIndexOf(".");
      const stem = dot >= 0 ? name.slice(0, dot) : name;
      const ext = dot >= 0 ? name.slice(dot) : "";
      let n = 2;
      while (used.has(`${stem}-${n}${ext}`)) n += 1;
      name = `${stem}-${n}${ext}`;
    }
    used.add(name);
    zip.file(name, entry.blob);
  }

  if (readme?.trim()) {
    zip.file("README.txt", readme.trim());
  }

  const archive = await zip.generateAsync({ type: "blob" });
  const date = new Date().toISOString().slice(0, 10);
  saveAs(archive, `${label}-${date}.zip`);
}
