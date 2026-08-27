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
              className="k-link-card group flex flex-col"
            >
              <div className="k-icon-box mb-3 group-hover:bg-[rgba(0,122,255,0.14)]">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="k-subheading">{tool.label}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[#86868b]">
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
