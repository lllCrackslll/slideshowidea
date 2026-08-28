import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type LimitationBannerProps = {
  title: string;
  children: ReactNode;
};

export function LimitationBanner({ title, children }: LimitationBannerProps) {
  return (
    <div className="k-banner-warn">
      <div className="mb-1 flex items-center gap-2 text-sm font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        {title}
      </div>
      <div className="text-xs leading-relaxed opacity-90">{children}</div>
    </div>
  );
}
