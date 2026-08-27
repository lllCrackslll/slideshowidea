import type { ToolGuide, ToolStatus } from "@/lib/tool-guides";

const STATUS_STYLES: Record<
  ToolStatus,
  { label: string; badge: string; dot: string }
> = {
  functional: {
    label: "Fonctionnel",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
  },
  partial: {
    label: "Partiel",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
  },
  unavailable: {
    label: "Non disponible",
    badge: "border-red-500/30 bg-red-500/10 text-red-400",
    dot: "bg-red-400",
  },
};

type ToolTutorialProps = {
  guide: ToolGuide;
  compact?: boolean;
  className?: string;
};

export function ToolTutorial({
  guide,
  compact = false,
  className = "",
}: ToolTutorialProps) {
  const status = STATUS_STYLES[guide.status];

  return (
    <div
      className={`rounded-xl border border-[#27272a] bg-[#0c0c0e] p-3 ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
        {!compact ? (
          <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
            Mode d&apos;emploi
          </span>
        ) : null}
      </div>

      {!compact ? (
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
          {guide.statusHint}
        </p>
      ) : null}

      <ol className="mt-2 space-y-1">
        {guide.steps.slice(0, compact ? 2 : undefined).map((step, i) => (
          <li
            key={step}
            className="flex gap-2 text-[11px] leading-relaxed text-zinc-400"
          >
            <span className="shrink-0 text-zinc-600">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
