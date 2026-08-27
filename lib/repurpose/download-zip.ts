export type RepurposeZipEntry = {
  filename: string;
  blob: Blob;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function downloadRepurposeZip(
  entries: RepurposeZipEntry[],
  label = "repurpose",
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

  zip.file(
    "README.txt",
    [
      "Pack Repurpose — carrousels.studio",
      "",
      `${entries.length} variante(s) unique(s).`,
      "Chaque MP4 = 1 version prête à publier sur un compte différent.",
    ].join("\n"),
  );

  const archive = await zip.generateAsync({ type: "blob" });
  const date = new Date().toISOString().slice(0, 10);
  const slug = slugify(label) || "repurpose";
  saveAs(archive, `${slug}-${date}.zip`);
}
