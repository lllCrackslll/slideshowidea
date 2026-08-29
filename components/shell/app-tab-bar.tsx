"use client";

import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/shell/brand-logo";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { useWorkspace } from "@/components/studio/workspace-context";
import { SECONDARY_NAV } from "@/lib/nav";
import {
  WORKFLOW_MAIN_STEPS,
  WORKFLOW_STATS_STEP,
  type WorkflowStep,
} from "@/lib/workspace/types";

function stepHref(step: WorkflowStep) {
  return `/?step=${step}`;
}

export function AppTabBar() {
  const pathname = usePathname();
  const onStudio = pathname === "/";
  const { step, setStep } = useWorkspace();

  function stepClass(id: WorkflowStep) {
    const active = onStudio && step === id;
    return [
      "k-nav-link min-h-9 min-w-0 flex-1 px-2.5 sm:min-w-[4.5rem] sm:flex-1 sm:px-3",
      active ? "k-nav-link-active" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return (
    <header className="k-nav">
      <div className="k-nav-glow-line" aria-hidden />
      <div className="mx-auto grid max-w-[1200px] grid-cols-[minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-2 px-3 py-2 sm:flex sm:h-14 sm:gap-2 sm:px-4 md:gap-3 md:px-6 sm:py-0">
        <BrandLogo className="col-start-1 row-start-1 min-w-0" />

        <div className="col-start-2 row-start-1 flex shrink-0 items-center gap-1">
          <Link
            href={stepHref(WORKFLOW_STATS_STEP.id)}
            onClick={() => setStep(WORKFLOW_STATS_STEP.id)}
            className={`k-nav-stats min-h-9 px-2.5 sm:px-3 ${
              onStudio && step === WORKFLOW_STATS_STEP.id ? "k-nav-stats-active" : ""
            }`}
            title={WORKFLOW_STATS_STEP.label}
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{WORKFLOW_STATS_STEP.label}</span>
          </Link>

          {SECONDARY_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`k-nav-link min-h-9 px-2.5 ${active ? "k-nav-link-active" : ""}`}
                title={item.label}
                aria-label={item.label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}

          <ThemeToggle />
        </div>

        <nav
          aria-label="Étapes du studio"
          className="k-nav-pill col-span-2 row-start-2 flex min-w-0 items-stretch gap-0.5 overflow-x-auto p-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:col-span-1 sm:row-start-1 sm:flex-1 sm:items-center [&::-webkit-scrollbar]:hidden"
        >
          {WORKFLOW_MAIN_STEPS.map((item) => (
            <Link
              key={item.id}
              href={stepHref(item.id as WorkflowStep)}
              onClick={() => setStep(item.id as WorkflowStep)}
              className={stepClass(item.id as WorkflowStep)}
            >
              <span className="truncate sm:hidden">{item.short}</span>
              <span className="hidden truncate sm:inline">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
