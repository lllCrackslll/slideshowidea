"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { useWorkspace } from "./workspace-context";

const PROMPT_TRANSLATE =
  "Traduis uniquement le texte visible de cette image en français, sans modifier les dimensions, la mise en page, les couleurs, les polices, les visuels ni aucun autre élément.";

function promptWithAppName(appName: string) {
  return `${PROMPT_TRANSLATE.slice(0, -1)}, et remplace le nom de l'app par ${appName}.`;
}

function PromptRow({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="k-row">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="k-label">{label}</p>
        <button type="button" onClick={() => void copy()} className="k-btn-ghost py-1">
          <Copy className="h-3.5 w-3.5" />
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <p className="text-sm leading-relaxed k-text-secondary">{text}</p>
    </div>
  );
}

export function AiPromptsBlock() {
  const { workspace } = useWorkspace();
  const appName = workspace?.name?.trim() || "Mon app";

  return (
    <section className="k-card-flat mb-4">
      <p className="k-label mb-3">Prompts IA</p>
      <div className="space-y-3">
        <PromptRow label="Traduction seule" text={PROMPT_TRANSLATE} />
        <PromptRow label="Traduction + nom d'app" text={promptWithAppName(appName)} />
      </div>
    </section>
  );
}
