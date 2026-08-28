import type { ToolGuide, ToolStatus } from "@/lib/tool-guides";

const STATUS_STYLES: Record<
  ToolStatus,
  { label: string; badge: string; dot: string }
> = {
  functional: {
    label: "Fonctionnel",
    badge: "k-status-functional",
    dot: "bg-[#007aff]",
  },
  partial: {
    label: "Partiel",
    badge: "k-status-partial",
    dot: "bg-amber-500",
  },
  unavailable: {
    label: "Non disponible",
    badge: "k-status-unavailable",
    dot: "bg-red-500",
  },
};

type ToolTutorialProps = {
  guide: ToolGuide;
  compact?: boolean;
  showStatus?: boolean;
  className?: string;
};

export function ToolTutorial({
  guide,
  compact = false,
  showStatus = true,
  className = "",
}: ToolTutorialProps) {
  const status = STATUS_STYLES[guide.status];

  return (
    <div className={`k-card ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {showStatus ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        ) : null}
        {!compact ? (
          <span className="k-label">Mode d&apos;emploi</span>
        ) : null}
      </div>

      {!compact ? (
        <p className="mt-2 text-[11px] leading-relaxed k-text-muted">
          {guide.statusHint}
        </p>
      ) : null}

      <ol className="mt-2 space-y-1">
        {guide.steps.slice(0, compact ? 2 : undefined).map((step, i) => (
          <li
            key={step}
            className="flex gap-2 text-[11px] leading-relaxed k-text-muted"
          >
            <span className="shrink-0 k-text-faint">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
