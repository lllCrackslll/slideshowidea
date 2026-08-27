import type { ReactNode } from "react";

type ToolPageProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function ToolPage({ title, subtitle, children }: ToolPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-6">
      <div className="mb-6">
        <h1 className="k-heading">{title}</h1>
        {subtitle ? <p className="k-muted mt-1">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
