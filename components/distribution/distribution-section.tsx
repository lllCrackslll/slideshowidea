"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

type DistributionSectionProps = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function DistributionSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: DistributionSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="k-card overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5"
      >
        <div className="min-w-0">
          <h3 className="k-subheading text-sm font-semibold">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] k-text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 k-accent transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="k-divider px-4 pb-4 pt-3 sm:px-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
