"use client";

import { Upload } from "lucide-react";
import { useCallback, useState } from "react";

type FileDropzoneProps = {
  accept?: string;
  multiple?: boolean;
  label?: string;
  hint?: string;
  onFiles: (files: File[]) => void;
};

export function FileDropzone({
  accept,
  multiple = false,
  label = "Glisse tes fichiers ici",
  hint = "ou clique pour parcourir",
  onFiles,
}: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 transition-colors ${
        dragging
          ? "border-zinc-400 bg-white/[0.04]"
          : "border-[#27272a] bg-[#0c0c0e] hover:border-zinc-600"
      }`}
    >
      <Upload className="mb-3 h-8 w-8 text-zinc-500" />
      <p className="text-sm font-medium text-zinc-200">{label}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}
