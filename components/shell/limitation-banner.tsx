import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type LimitationBannerProps = {
  title: string;
  children: ReactNode;
};

export function LimitationBanner({ title, children }: LimitationBannerProps) {
  return (
    <div className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {title}
      </div>
      <div className="text-xs leading-relaxed text-amber-100/80">{children}</div>
    </div>
  );
}
