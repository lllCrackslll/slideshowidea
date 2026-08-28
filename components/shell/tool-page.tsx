import type { ReactNode } from "react";

type ToolPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ToolPage({ title, subtitle, children }: ToolPageProps) {
  return (
    <div className="k-page pb-10">
      <div className="mb-6">
        <h1 className="k-heading">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm k-text-muted">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
