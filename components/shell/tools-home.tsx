"use client";

import Link from "next/link";
import { TOOLS } from "@/lib/nav";
import { getToolGuide } from "@/lib/tool-guides";
import { ToolPage } from "@/components/shell/tool-page";

export function ToolsHome() {
  return (
    <ToolPage
      title="Outils"
      subtitle="Suite d'outils image et vidéo — tout s'exécute localement dans ton navigateur."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const guide = getToolGuide(tool.href);
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card)]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="font-medium text-[var(--foreground)]">{tool.label}</h2>
              <p className="mt-1 flex-1 text-sm k-text-muted">
                {tool.description ?? guide?.statusHint}
              </p>
            </Link>
          );
        })}
      </div>
    </ToolPage>
  );
}
