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
    return `k-nav-link flex-1 ${onStudio && step === id ? "k-nav-link-active" : ""}`;
  }

  return (
    <header className="k-nav">
      <div className="k-nav-glow-line" aria-hidden />
      <div className="mx-auto flex h-[56px] max-w-[1200px] items-center gap-3 pl-0 pr-4 sm:pr-6">
        <BrandLogo />

        <nav className="k-nav-pill flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {WORKFLOW_MAIN_STEPS.map((item) => (
            <Link
              key={item.id}
              href={stepHref(item.id as WorkflowStep)}
              onClick={() => setStep(item.id as WorkflowStep)}
              className={stepClass(item.id as WorkflowStep)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={stepHref(WORKFLOW_STATS_STEP.id)}
          onClick={() => setStep(WORKFLOW_STATS_STEP.id)}
          className={`k-nav-stats ${onStudio && step === WORKFLOW_STATS_STEP.id ? "k-nav-stats-active" : ""}`}
          title={WORKFLOW_STATS_STEP.label}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">{WORKFLOW_STATS_STEP.label}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          {SECONDARY_NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`k-nav-link px-2.5 ${active ? "k-nav-link-active" : ""}`}
                title={item.label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
