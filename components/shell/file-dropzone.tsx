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
      className={`k-dropzone ${dragging ? "k-dropzone-active" : ""}`}
    >
      <Upload className="mb-3 h-8 w-8 text-[#007aff]" />
      <p className="text-sm font-medium text-[#1d1d1f]">{label}</p>
      <p className="mt-1 text-xs text-[#86868b]">{hint}</p>
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
