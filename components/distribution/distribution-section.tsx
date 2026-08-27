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
          <h3 className="text-sm font-semibold text-[#1d1d1f]">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-[#86868b]">
              {subtitle}
            </p>
          ) : null}
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#007aff] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="border-t border-[rgba(0,122,255,0.08)] px-4 pb-4 pt-3 sm:px-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
