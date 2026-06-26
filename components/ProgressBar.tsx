// Thin reusable progress bar. `barClass` controls the fill color.
export function ProgressBar({
  value,
  max,
  barClass = "bg-blue-500",
  className = "",
}: {
  value: number;
  max: number;
  barClass?: string;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={`h-2 rounded-full bg-slate-100 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full transition-all ${barClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
