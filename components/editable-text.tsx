"use client";

import { useState } from "react";

type EditableTextProps = {
  initialValue: string;
  onChange: (value: string) => void;
  className?: string;
  multiline?: boolean;
};

export function EditableText({
  initialValue,
  onChange,
  className = "",
  multiline = true,
}: EditableTextProps) {
  const [seed] = useState(initialValue);

  return (
    <div
      contentEditable
      role="textbox"
      aria-multiline={multiline}
      suppressContentEditableWarning
      title="Cliquer pour éditer"
      className={`k-editable cursor-text whitespace-pre-wrap break-words rounded-lg outline-none transition-colors ${className}`}
      onInput={(event) => onChange(event.currentTarget.innerText)}
      onKeyDown={(event) => {
        if (!multiline && event.key === "Enter") event.preventDefault();
      }}
    >
      {seed}
    </div>
  );
}
