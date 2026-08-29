"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SourcingStep } from "@/components/studio/steps/sourcing-step";
import { CleanStep } from "@/components/studio/steps/clean-step";
import { ScheduleStep } from "@/components/studio/steps/schedule-step";
import { AnalyticsStep } from "@/components/studio/steps/analytics-step";
import { useWorkspace } from "@/components/studio/workspace-context";
import type { WorkflowStep } from "@/lib/workspace/types";

const VALID_STEPS: WorkflowStep[] = [
  "sourcing",
  "clean",
  "schedule",
  "analytics",
];

function normalizeStep(raw: string | null): WorkflowStep | null {
  if (!raw) return null;
  if (raw === "editor") return "clean";
  return VALID_STEPS.includes(raw as WorkflowStep) ? (raw as WorkflowStep) : null;
}

function StudioContentInner() {
  const { ready, step, setStep } = useWorkspace();
  const searchParams = useSearchParams();

  useEffect(() => {
    const param = searchParams.get("step");
    const normalized = normalizeStep(param);
    if (normalized) setStep(normalized);
  }, [searchParams, setStep]);

  if (!ready) {
    return (
      <div className="k-page py-20 text-center text-sm k-text-muted">
        …
      </div>
    );
  }

  return (
    <div className="k-page pb-10">
      {step === "sourcing" ? <SourcingStep /> : null}
      {step === "clean" ? <CleanStep /> : null}
      {step === "schedule" ? <ScheduleStep /> : null}
      {step === "analytics" ? <AnalyticsStep /> : null}
    </div>
  );
}

export function StudioApp() {
  return (
    <Suspense
      fallback={
        <div className="k-page py-20 text-center text-sm k-text-muted">…</div>
      }
    >
      <StudioContentInner />
    </Suspense>
  );
}
