"use client";

type FilterControlProps = {
  title: string;
  enabled: boolean;
  min: number;
  max: number;
  onToggle: (enabled: boolean) => void;
  onRange: (min: number, max: number) => void;
  step?: number;
};

export function FilterControl({
  title,
  enabled,
  min,
  max,
  onToggle,
  onRange,
  step = 0.01,
}: FilterControlProps) {
  return (
    <div className="rounded-lg border border-[#27272a] bg-[#0c0c0e] p-2.5">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-zinc-100"
        />
        <span className="text-xs font-medium text-zinc-200">{title}</span>
      </label>
      {enabled ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-[10px] text-zinc-500">
            Min
            <input
              type="number"
              step={step}
              value={min}
              onChange={(e) => onRange(Number(e.target.value), max)}
              className="mt-0.5 h-7 w-full rounded border border-[#27272a] bg-transparent px-1.5 text-xs text-zinc-200"
            />
          </label>
          <label className="text-[10px] text-zinc-500">
            Max
            <input
              type="number"
              step={step}
              value={max}
              onChange={(e) => onRange(min, Number(e.target.value))}
              className="mt-0.5 h-7 w-full rounded border border-[#27272a] bg-transparent px-1.5 text-xs text-zinc-200"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
