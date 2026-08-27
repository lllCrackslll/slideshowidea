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
    <div className="k-card p-2.5">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="accent-[#007aff]"
        />
        <span className="text-xs font-medium text-[#1d1d1f]">{title}</span>
      </label>
      {enabled ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-[10px] text-[#86868b]">
            Min
            <input
              type="number"
              step={step}
              value={min}
              onChange={(e) => onRange(Number(e.target.value), max)}
              className="k-input mt-0.5 h-7 w-full px-1.5 text-xs"
            />
          </label>
          <label className="text-[10px] text-[#86868b]">
            Max
            <input
              type="number"
              step={step}
              value={max}
              onChange={(e) => onRange(min, Number(e.target.value))}
              className="k-input mt-0.5 h-7 w-full px-1.5 text-xs"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
