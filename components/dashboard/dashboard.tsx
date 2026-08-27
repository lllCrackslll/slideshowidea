"use client";

import Link from "next/link";
import { DASHBOARD_TOOLS } from "@/lib/nav";
import { getToolGuide } from "@/lib/tool-guides";
import { ToolPage } from "@/components/shell/tool-page";
import { ToolTutorial } from "@/components/shell/tool-tutorial";

export function Dashboard() {
  return (
    <ToolPage
      title="Dashboard"
      subtitle="Carrousels TikTok en priorité — génère, exporte, publie sur plusieurs comptes."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const guide = getToolGuide(tool.href);
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-xl border border-[#27272a] bg-[#0c0c0e] p-4 transition-colors hover:border-zinc-600 hover:bg-[#101012]"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-zinc-200 group-hover:bg-white/[0.1]">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-medium text-zinc-100">{tool.label}</h2>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                {tool.description}
              </p>
              {guide ? (
                <div className="mt-3 flex-1">
                  <ToolTutorial guide={guide} compact />
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </ToolPage>
  );
}
